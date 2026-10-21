import { Ionicons } from '@expo/vector-icons';
import { useQueryClient } from '@tanstack/react-query';
import { ComponentProps, useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Button, Card, Screen } from '@/components/ui';
import { useGoals } from '@/hooks/useGoals';
import { useHabits } from '@/hooks/useHabits';
import { calcStreak, today } from '@/lib/dates';
import { supabase } from '@/lib/supabase';
import { theme } from '@/lib/theme';
import { useAuth } from '@/providers/AuthProvider';

const c = theme.colors;
type IconName = ComponentProps<typeof Ionicons>['name'];

function initialsOf(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  const first = parts[0][0];
  const second = parts.length > 1 ? parts[parts.length - 1][0] : '';
  return (first + second).toUpperCase();
}

function Stat({ icon, value, label }: { icon: IconName; value: string | number; label: string }) {
  return (
    <View style={s.stat}>
      <Ionicons name={icon} size={20} color={c.primary} />
      <Text style={s.statValue}>{value}</Text>
      <Text style={s.statLabel}>{label}</Text>
    </View>
  );
}

export default function ProfileScreen() {
  const { session } = useAuth();
  const qc = useQueryClient();
  const habits = useHabits();
  const goals = useGoals();
  const [signingOut, setSigningOut] = useState(false);

  const user = session?.user;
  const email = user?.email ?? '';
  const fullName = (user?.user_metadata?.full_name as string | undefined)?.trim();
  const displayName = fullName || email.split('@')[0] || 'Você';
  const memberSince = user?.created_at
    ? new Date(user.created_at).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
    : null;

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
    await supabase.auth.signOut(); // o Stack.Protected leva para o login
    qc.clear();
  };

  return (
    <Screen>
      <Card>
        <View style={s.header}>
          <View style={s.avatar} accessibilityLabel={`Avatar de ${displayName}`}>
            <Text style={s.avatarText}>{initialsOf(fullName || email)}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.name} numberOfLines={1}>{displayName}</Text>
            <Text style={s.email} numberOfLines={1}>{email}</Text>
            {memberSince && <Text style={s.since}>Membro desde {memberSince}</Text>}
          </View>
        </View>
      </Card>

      <Card>
        <Text style={s.sectionTitle}>Seu resumo</Text>
        <View style={s.grid}>
          <Stat icon="list-outline" value={stats.active} label="hábitos ativos" />
          <Stat icon="checkmark-done-outline" value={`${stats.doneToday}/${stats.active}`} label="concluídos hoje" />
          <Stat icon="flame-outline" value={stats.bestStreak} label="maior sequência atual" />
          <Stat icon="calendar-outline" value={stats.checkins} label="check-ins (120 dias)" />
          <Stat icon="flag-outline" value={`${stats.goalsDone}/${stats.goalsTotal}`} label="metas concluídas" />
        </View>
      </Card>

      <Button label="Sair da conta" variant="danger" onPress={logout} loading={signingOut} />
    </Screen>
  );
}

const s = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  avatar: { width: 64, height: 64, borderRadius: 32, backgroundColor: c.primary, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#fff', fontSize: 24, fontWeight: '800' },
  name: { fontSize: 20, fontWeight: '700', color: c.ink },
  email: { fontSize: 14, color: c.muted, marginTop: 2 },
  since: { fontSize: 12, color: c.muted, marginTop: 4, textTransform: 'capitalize' },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: c.ink, marginBottom: 12 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  stat: {
    flexGrow: 1,
    flexBasis: '45%',
    gap: 4,
    padding: 14,
    borderRadius: theme.radius.sm,
    backgroundColor: c.primarySoft,
  },
  statValue: { fontSize: 24, fontWeight: '800', color: c.ink },
  statLabel: { fontSize: 13, color: c.muted },
});
