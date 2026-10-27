import { useMemo, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { HabitCalendar } from '@/components/HabitCalendar';
import { HabitCard } from '@/components/HabitCard';
import { HabitFormModal } from '@/components/HabitFormModal';
import { Button, Card, ErrorText, ProgressBar, Screen } from '@/components/ui';
import { useDeleteHabit, useHabits, useToggleLog } from '@/hooks/useHabits';
import { calcStreak, countInWeek, startOfWeek, today } from '@/lib/dates';
import { useTheme } from '@/providers/ThemeProvider';
import type { Habit } from '@/lib/types';


export default function TodayScreen() {
  const { colors: c } = useTheme();
  const { data, isLoading, error } = useHabits();
  const toggle = useToggleLog();
  const remove = useDeleteHabit();
  const [editing, setEditing] = useState<Habit | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const todayStr = today();

  const view = useMemo(() => {
    // Hábitos com horário primeiro (do mais cedo ao mais tarde); os demais mantêm a ordem de criação.
    const habits = [...(data?.habits ?? [])].sort((a, b) =>
      (a.reminder_time ?? '99:99').localeCompare(b.reminder_time ?? '99:99'),
    );
    const byHabit = new Map<string, Set<string>>();
    const doneByDate = new Map<string, number>();
    for (const l of data?.logs ?? []) {
      if (!byHabit.has(l.habit_id)) byHabit.set(l.habit_id, new Set());
      byHabit.get(l.habit_id)!.add(l.log_date);
      doneByDate.set(l.log_date, (doneByDate.get(l.log_date) ?? 0) + 1);
    }
    const weekStart = startOfWeek(new Date());
    const rows = habits.map((h) => {
      const dates = byHabit.get(h.id) ?? new Set<string>();
      return {
        habit: h,
        doneToday: dates.has(todayStr),
        streak: calcStreak(h, dates),
        weekCount: countInWeek(dates, weekStart),
      };
    });
    const done = rows.filter((r) => r.doneToday).length;
    return { rows, done, total: habits.length, pct: habits.length ? Math.round((done / habits.length) * 100) : 0, doneByDate };
  }, [data, todayStr]);

  const openNew = () => { setEditing(null); setFormOpen(true); };

  // Capitaliza só a primeira letra ("segunda-feira, 26 de outubro" -> "Segunda-feira, 26 de outubro").
  const dateLabel = (() => {
    const d = new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });
    return d.charAt(0).toUpperCase() + d.slice(1);
  })();

  return (
    <Screen title="Hoje" subtitle={dateLabel}>
      <Card style={[s.hero, { backgroundColor: c.primary, borderColor: c.primary }]} >
        <View style={s.summaryRow}>
          <Text style={s.pct}>{view.pct}%</Text>
          <Text style={s.summaryText}>{view.total ? `${view.done} de ${view.total} hábitos concluídos hoje` : 'Nenhum hábito ainda'}</Text>
        </View>
        <ProgressBar pct={view.pct} color="#fff" trackColor="rgba(255,255,255,0.25)" height={12} />
      </Card>

      {isLoading && <ActivityIndicator color={c.primary} />}
      <ErrorText message={error ? 'Não foi possível carregar seus hábitos.' : null} />
      <ErrorText message={remove.isError ? 'Não foi possível excluir o hábito.' : null} />

      {view.total > 0 && <Text style={[s.sectionTitle, { color: c.ink }]}>Seus hábitos</Text>}
      <View style={{ gap: 12 }}>
        {view.rows.map(({ habit, doneToday, streak, weekCount }) => (
          <HabitCard
            key={habit.id}
            habit={habit}
            doneToday={doneToday}
            streak={streak}
            weekCount={weekCount}
            onToggle={() => toggle.mutate({ habitId: habit.id, date: todayStr, done: !doneToday })}
            onEdit={() => { setEditing(habit); setFormOpen(true); }}
            onDelete={() => remove.mutate(habit.id)}
          />
        ))}
      </View>

      {!isLoading && view.total === 0 && (
        <Card>
          <Text style={[s.emptyTitle, { color: c.ink }]}>Comece com um hábito simples</Text>
          <Text style={[s.emptySub, { color: c.muted }]}>Algo que leve menos de 5 minutos, como beber um copo de água ao acordar.</Text>
        </Card>
      )}

      <Button label="Novo hábito" icon="add" onPress={openNew} />

      {view.total > 0 && (
        <Card>
          <Text style={[s.emptyTitle, { color: c.ink, marginBottom: 14 }]}>Calendário de consistência</Text>
          <HabitCalendar doneByDate={view.doneByDate} totalHabits={view.total} />
        </Card>
      )}

      <HabitFormModal visible={formOpen} habit={editing} onClose={() => setFormOpen(false)} />
    </Screen>
  );
}

const s = StyleSheet.create({
  hero: { padding: 24, gap: 18 },
  summaryRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  pct: { fontSize: 56, lineHeight: 60, fontWeight: '800', color: '#fff', letterSpacing: -1 },
  summaryText: { flex: 1, color: '#E6F2EC', fontSize: 16, lineHeight: 22, fontWeight: '500' },
  sectionTitle: { fontSize: 20, fontWeight: '800', paddingHorizontal: 4, marginTop: 4 },
  emptyTitle: { fontSize: 17, fontWeight: '700', },
  emptySub: { fontSize: 14, lineHeight: 20, marginTop: 4 },
});
