import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { addDays, toISODate } from '@/lib/dates';
import { useTheme } from '@/providers/ThemeProvider';

const WEEKDAYS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
const MONTHS = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];

/** Calendário mensal: cada dia mostra a proporção de hábitos concluídos e os detalhes do dia selecionado. */
export function HabitCalendar({ doneByDate, totalHabits }: { doneByDate: Map<string, number>; totalHabits: number }) {
  const { colors: c } = useTheme();
  const [month, setMonth] = useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const [selected, setSelected] = useState(toISODate(new Date()));
  const today = toISODate(new Date());
  const days = useMemo(() => {
    const first = new Date(month.getFullYear(), month.getMonth(), 1);
    const offset = (first.getDay() + 6) % 7;
    const start = addDays(first, -offset);
    return Array.from({ length: 42 }, (_, i) => addDays(start, i));
  }, [month]);
  const done = doneByDate.get(selected) ?? 0;
  const isSelectedCurrentMonth = selected.slice(0, 7) === `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, '0')}`;

  const changeMonth = (delta: number) => setMonth(new Date(month.getFullYear(), month.getMonth() + delta, 1));
  return (
    <View style={s.container}>
      <View style={s.monthHeader}>
        <Pressable accessibilityRole="button" accessibilityLabel="Mês anterior" onPress={() => changeMonth(-1)} style={[s.navButton, { borderColor: c.line }]}>
          <Text style={[s.navText, { color: c.ink }]}>‹</Text>
        </Pressable>
        <Text accessibilityRole="header" style={[s.monthTitle, { color: c.ink }]}>{MONTHS[month.getMonth()]} {month.getFullYear()}</Text>
        <Pressable accessibilityRole="button" accessibilityLabel="Mês seguinte" onPress={() => changeMonth(1)} style={[s.navButton, { borderColor: c.line }]}>
          <Text style={[s.navText, { color: c.ink }]}>›</Text>
        </Pressable>
      </View>
      <View style={s.grid}>
        {WEEKDAYS.map(day => <Text key={day} style={[s.weekday, { color: c.muted }]}>{day}</Text>)}
        {days.map(date => {
          const iso = toISODate(date);
          const inMonth = date.getMonth() === month.getMonth();
          const future = iso > today;
          const count = doneByDate.get(iso) ?? 0;
          const ratio = totalHabits ? Math.min(1, count / totalHabits) : 0;
          const active = selected === iso;
          return (
            <Pressable key={iso} accessibilityRole="button" accessibilityLabel={`${date.toLocaleDateString('pt-BR')}: ${count} de ${totalHabits} hábitos concluídos`} accessibilityState={{ selected: active }} onPress={() => setSelected(iso)}
              style={[s.dayCell, { backgroundColor: active ? c.primary : ratio > 0 ? c.primarySoft : 'transparent', borderColor: active ? c.primary : iso === today ? c.primary : 'transparent', opacity: inMonth ? (future ? 0.45 : 1) : 0.35 }]}>
              <Text style={[s.dayNumber, { color: active ? '#fff' : c.ink }]}>{date.getDate()}</Text>
              <View style={[s.dot, { backgroundColor: active ? '#fff' : c.primary, opacity: ratio > 0 ? 0.35 + ratio * 0.65 : 0 }]} />
            </Pressable>
          );
        })}
      </View>
      <View style={[s.summary, { borderTopColor: c.line }]}>
        <Text style={[s.summaryDate, { color: c.ink }]}>{new Date(`${selected}T12:00:00`).toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}</Text>
        <Text style={[s.summaryCount, { color: c.muted }]}>{isSelectedCurrentMonth ? `${done} de ${totalHabits} hábitos concluídos` : `${done} hábitos concluídos`}</Text>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: { gap: 12 },
  monthHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  monthTitle: { fontSize: 17, fontWeight: '700', textTransform: 'capitalize' },
  navButton: { width: 36, height: 36, borderWidth: 1, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  navText: { fontSize: 26, lineHeight: 30, marginTop: -3 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', rowGap: 5 },
  weekday: { width: `${100 / 7}%`, textAlign: 'center', fontSize: 11, fontWeight: '600', paddingBottom: 4 },
  dayCell: { width: `${100 / 7}%`, height: 42, borderWidth: 1, borderRadius: 10, alignItems: 'center', justifyContent: 'center', gap: 2 },
  dayNumber: { fontSize: 13, fontWeight: '600' },
  dot: { width: 4, height: 4, borderRadius: 2 },
  summary: { borderTopWidth: 1, paddingTop: 12, gap: 3 },
  summaryDate: { fontSize: 14, fontWeight: '700', textTransform: 'capitalize' },
  summaryCount: { fontSize: 13 },
});
