import { Ionicons } from '@expo/vector-icons';
import { useQueryClient } from '@tanstack/react-query';
import { ComponentProps, useMemo, useState } from 'react';
import { StyleSheet, Switch, Text, View } from 'react-native';
import { Button, Card, Screen } from '@/components/ui';
import { useGoals } from '@/hooks/useGoals';
import { useHabits } from '@/hooks/useHabits';
import { calcStreak, today } from '@/lib/dates';
import { supabase } from '@/lib/supabase';
import { useTheme } from '@/providers/ThemeProvider';
import { theme } from '@/lib/theme';

import { useAuth } from '@/providers/AuthProvider';

type IconName = ComponentProps<typeof Ionicons>['name'];

function initialsOf(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  const first = parts[0][0];
  const second = parts.length > 1 ? parts[parts.length - 1][0] : '';
  return (first + second).toUpperCase();
}

function Stat({ icon, value, label }: { icon: IconName; value: string | number; label: string }) {
  const { colors: c } = useTheme();
  return (
    <View style={[s.stat, { backgroundColor: c.primarySoft }]} >
      <View style={[s.statIcon, { backgroundColor: c.surface }]} >
        <Ionicons name={icon} size={20} color={c.primary} />
      </View>
      <Text style={[s.statValue, { color: c.ink }]}>{value}</Text>
      <Text style={[s.statLabel, { color: c.muted }]}>{label}</Text>
    </View>
  );
}

export default function ProfileScreen() {
  const { colors: c, mode, toggleMode } = useTheme();
  const { session } = useAuth();
  const qc = useQueryClient();
  const habits = useHabits();
  const goals = useGoals();
  const [signingOut, setSigningOut] = useState(false);

  const user = session?.user;
  const email = user?.email ?? '';
  const fullName = (user?.user_metadata?.full_name as string | undefined)?.trim();
  const displayName = fullName || email.split('@')[0] || 'Você';
  const memberSinceRaw = user?.created_at
    ? new Date(user.created_at).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
    : null;
  // Só a primeira letra maiúscula ("outubro de 2026" -> "Outubro de 2026").
  const memberSince = memberSinceRaw ? memberSinceRaw.charAt(0).toUpperCase() + memberSinceRaw.slice(1) : null;

  const stats = useMemo(() => {
    const list = habits.data?.habits ?? [];
    const logs = habits.data?.logs ?? [];
    const todayStr = today();
    const byHabit = new Map<string, Set<string>>();
    for (const l of logs) {
      if (!byHabit.has(l.habit_id)) byHabit.set(l.habit_id, new Set());
      byHabit.get(l.habit_id)!.add(l.log_date);
    }
    const doneToday = list.filter((h) => byHabit.get(h.id)?.has(todayStr)).length;
    const bestStreak = list.reduce(
      (max, h) => Math.max(max, calcStreak(h, byHabit.get(h.id) ?? new Set<string>())),
      0,
    );
    const goalList = goals.data ?? [];
    return {
      active: list.length,
      doneToday,
      checkins: logs.length,
      bestStreak,
      goalsDone: goalList.filter((g) => g.current_value >= g.target_value).length,
      goalsTotal: goalList.length,
    };
  }, [habits.data, goals.data]);

  const logout = async () => {
    setSigningOut(true);
    try {
      await supabase.auth.signOut(); // o AuthGuard leva para o login
      qc.clear();
    } finally {
      setSigningOut(false);
    }
  };

  return (
    <Screen title="Perfil">
      <Card>
        <View style={s.header}>
          <View style={[s.avatar, { backgroundColor: c.primary }]} accessibilityLabel={`Avatar de ${displayName}`}>
            <Text style={s.avatarText}>{initialsOf(fullName || email)}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[s.name, { color: c.ink }]} numberOfLines={1}>{displayName}</Text>
            <Text style={[s.email, { color: c.muted }]} numberOfLines={1}>{email}</Text>
            {memberSince && <Text style={[s.since, { color: c.muted }]} >Membro desde {memberSince}</Text>}
          </View>
        </View>
      </Card>

      <Card>
        <View style={s.themeRow}>
          <View style={s.themeCopy}>
            <Text style={[s.sectionTitle, { color: c.ink, marginBottom: 4 }]}>Modo escuro</Text>
            <Text style={[s.email, { color: c.muted }]}>Personaliza a aparência da aplicação</Text>
          </View>
          <Switch accessibilityLabel="Ativar modo escuro" value={mode === 'dark'} onValueChange={toggleMode} trackColor={{ false: c.line, true: c.primary }} thumbColor="#fff" />
        </View>
      </Card>

      <Card>
        <Text style={[s.sectionTitle, { color: c.ink }]}>Seu resumo</Text>
        <View style={s.grid}>
          <Stat icon="list-outline" value={stats.active} label="hábitos ativos" />
          <Stat icon="checkmark-done-outline" value={`${stats.doneToday}/${stats.active}`} label="concluídos hoje" />
          <Stat icon="flame-outline" value={stats.bestStreak} label="maior sequência atual" />
          <Stat icon="calendar-outline" value={stats.checkins} label="check-ins (120 dias)" />
          <Stat icon="flag-outline" value={`${stats.goalsDone}/${stats.goalsTotal}`} label="metas concluídas" />
        </View>
      </Card>

      {/* Único ponto de saída da conta no app. */}
      <View style={s.logout}>
        <Button label="Sair da conta" icon="log-out-outline" variant="danger" onPress={logout} loading={signingOut} />
      </View>
    </Screen>
  );
}

const s = StyleSheet.create({
  themeRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  themeCopy: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 18 },
  avatar: { width: 72, height: 72, borderRadius: 36, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#fff', fontSize: 28, fontWeight: '800' },
  name: { fontSize: 22, fontWeight: '800', letterSpacing: -0.3 },
  email: { fontSize: 14, marginTop: 2 },
  since: { fontSize: 13, marginTop: 6 },
  sectionTitle: { fontSize: 20, fontWeight: '800', marginBottom: 16 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  stat: {
    flexGrow: 1,
    flexBasis: '45%',
    gap: 6,
    padding: 16,
    borderRadius: theme.radius.md + 2,
  },
  statIcon: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', marginBottom: 2 },
  statValue: { fontSize: 30, lineHeight: 34, fontWeight: '800', letterSpacing: -0.5 },
  statLabel: { fontSize: 13, lineHeight: 18, fontWeight: '500' },
  logout: { marginTop: 6 },
});
