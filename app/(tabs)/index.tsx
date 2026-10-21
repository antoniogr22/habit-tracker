import { useMemo, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { ConsistencyGrid } from '@/components/ConsistencyGrid';
import { HabitCard } from '@/components/HabitCard';
import { HabitFormModal } from '@/components/HabitFormModal';
import { Button, Card, ErrorText, ProgressBar, Screen } from '@/components/ui';
import { useDeleteHabit, useHabits, useToggleLog } from '@/hooks/useHabits';
import { calcStreak, countInWeek, startOfWeek, today } from '@/lib/dates';
import { theme } from '@/lib/theme';
import type { Habit } from '@/lib/types';

const c = theme.colors;

export default function TodayScreen() {
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

  return (
    <Screen>
      <Card>
        <Text style={s.kicker}>{new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}</Text>
        <View style={s.summaryRow}>
          <Text style={s.pct}>{view.pct}%</Text>
          <Text style={s.summaryText}>{view.total ? `${view.done} de ${view.total} hábitos concluídos hoje` : 'Nenhum hábito ainda'}</Text>
        </View>
        <ProgressBar pct={view.pct} />
      </Card>

      {isLoading && <ActivityIndicator color={c.primary} />}
      <ErrorText message={error ? 'Não foi possível carregar seus hábitos.' : null} />
      <ErrorText message={remove.isError ? 'Não foi possível excluir o hábito.' : null} />

      <View style={{ gap: 10 }}>
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
          <Text style={s.emptyTitle}>Comece com um hábito simples</Text>
          <Text style={s.emptySub}>Algo que leve menos de 5 minutos, como beber um copo de água ao acordar.</Text>
        </Card>
      )}

      <Button label="Novo hábito" onPress={openNew} />

      {view.total > 0 && (
        <Card>
          <Text style={[s.emptyTitle, { marginBottom: 12 }]}>Consistência nas últimas 5 semanas</Text>
          <ConsistencyGrid doneByDate={view.doneByDate} totalHabits={view.total} />
        </Card>
      )}

      <HabitFormModal visible={formOpen} habit={editing} onClose={() => setFormOpen(false)} />
    </Screen>
  );
}

const s = StyleSheet.create({
  kicker: { color: c.muted, fontSize: 14, textTransform: 'capitalize', marginBottom: 8 },
  summaryRow: { flexDirection: 'row', alignItems: 'baseline', gap: 12, marginBottom: 12 },
  pct: { fontSize: 44, fontWeight: '800', color: c.ink },
  summaryText: { flex: 1, color: c.muted, fontSize: 15 },
  emptyTitle: { fontSize: 16, fontWeight: '600', color: c.ink },
  emptySub: { fontSize: 13, color: c.muted, marginTop: 2 },
});
