import { StyleSheet, Text, View } from 'react-native';
import { addDays, startOfWeek, toISODate } from '@/lib/dates';
import { theme } from '@/lib/theme';

const WEEKS = 5;
const LABELS = ['S', 'T', 'Q', 'Q', 'S', 'S', 'D'];

/** Calendário de consistência: intensidade = % de hábitos concluídos no dia. */
export function ConsistencyGrid({ doneByDate, totalHabits }: { doneByDate: Map<string, number>; totalHabits: number }) {
  const now = new Date();
  const todayStr = toISODate(now);
  const start = addDays(startOfWeek(now), -(WEEKS - 1) * 7);

  return (
    <View style={{ gap: 6 }}>
      <View style={s.row}>
        {LABELS.map((l, i) => (
          <Text key={i} style={s.dayLabel}>{l}</Text>
        ))}
      </View>
      {Array.from({ length: WEEKS }, (_, w) => (
        <View key={w} style={s.row}>
          {Array.from({ length: 7 }, (_, d) => {
            const date = addDays(start, w * 7 + d);
            const iso = toISODate(date);
            const future = iso > todayStr;
            const ratio = totalHabits ? Math.min(1, (doneByDate.get(iso) ?? 0) / totalHabits) : 0;
            return (
              <View key={d} style={s.cellWrap}>
                <View
                  accessibilityLabel={`${date.toLocaleDateString('pt-BR')}: ${Math.round(ratio * 100)}%`}
                  style={[
                    s.cell,
                    future
                      ? { backgroundColor: 'transparent', borderWidth: 1, borderColor: theme.colors.line, borderStyle: 'dashed' }
                      : ratio === 0
                        ? { backgroundColor: theme.colors.line }
                        : { backgroundColor: theme.colors.primary, opacity: 0.25 + 0.75 * ratio },
                    iso === todayStr && { borderWidth: 2, borderColor: theme.colors.ink },
                  ]}
                />
              </View>
            );
          })}
        </View>
      ))}
    </View>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: 'row', gap: 6 },
  dayLabel: { flex: 1, textAlign: 'center', fontSize: 12, color: theme.colors.muted },
  cellWrap: { flex: 1 },
  cell: { aspectRatio: 1, borderRadius: 6 },
});
