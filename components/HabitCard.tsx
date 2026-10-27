import { Ionicons } from '@expo/vector-icons';
import { useRef } from 'react';
import { Animated, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { confirmAction } from '@/lib/confirm';
import { theme } from '@/lib/theme';
import { useTheme } from '@/providers/ThemeProvider';
import type { Habit } from '@/lib/types';


interface HabitCardProps {
  habit: Habit;
  doneToday: boolean;
  streak: number;
  weekCount: number;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export function HabitCard({ habit, doneToday, streak, weekCount, onToggle, onEdit, onDelete }: HabitCardProps) {
  const { colors: c } = useTheme();
  const scale = useRef(new Animated.Value(1)).current;
  const native = Platform.OS !== 'web';

  const handleToggle = () => {
    // Pulso rápido no check ao marcar/desmarcar.
    Animated.sequence([
      Animated.timing(scale, { toValue: 0.78, duration: 80, useNativeDriver: native }),
      Animated.spring(scale, { toValue: 1, friction: 4, useNativeDriver: native }),
    ]).start();
    onToggle();
  };

  const handleDelete = () =>
    confirmAction(`Excluir "${habit.title}" e todo o histórico dele?`, onDelete);

  const isWeekly = habit.frequency === 'weekly';
  const base = isWeekly
    ? `${weekCount}/${habit.weekly_target} nesta semana${doneToday ? ' · feito hoje' : ''}`
    : doneToday
      ? 'Concluído hoje'
      : 'Todos os dias';
  const subtitle = habit.reminder_time ? `${base} · ${habit.reminder_time.slice(0, 5)}` : base;

  return (
    <View style={[s.card, { backgroundColor: doneToday ? c.primarySoft : c.surface, borderColor: doneToday ? c.primary : c.line }]}>
      <Animated.View style={{ transform: [{ scale }] }}>
        <Pressable
          accessibilityRole="checkbox"
          accessibilityState={{ checked: doneToday }}
          accessibilityLabel={habit.title}
          onPress={handleToggle}
          style={[s.check, { borderColor: c.line, backgroundColor: doneToday ? c.primary : c.surface }]}
        >
          {doneToday && <Ionicons name="checkmark" size={22} color="#fff" />}
        </Pressable>
      </Animated.View>

      <View style={{ flex: 1 }}>
        <Text
          numberOfLines={2}
          style={[s.title, { color: doneToday ? c.muted : c.ink }, doneToday && { textDecorationLine: 'line-through' }]}
        >
          {habit.title}
        </Text>
        <Text style={[s.sub, { color: doneToday ? c.primary : c.muted }, doneToday && { fontWeight: '600' }]}>{subtitle}</Text>
      </View>

      <View style={[s.streak, { backgroundColor: c.accentSoft }]} >
        <Ionicons name="flame" size={18} color={streak > 0 ? c.accent : c.muted} />
        <Text style={[s.streakText, { color: streak === 0 ? c.muted : c.ink }]}>
          {streak}{isWeekly ? ' sem' : ' d'}
        </Text>
      </View>

      <View style={s.actions}>
        <Pressable accessibilityLabel={`Editar ${habit.title}`} onPress={onEdit} hitSlop={6} style={[s.iconBtn, { backgroundColor: c.bg }]}>
          <Ionicons name="create-outline" size={22} color={c.ink} />
        </Pressable>
        <Pressable accessibilityLabel={`Excluir ${habit.title}`} onPress={handleDelete} hitSlop={6} style={[s.iconBtn, { backgroundColor: c.dangerSoft }]}>
          <Ionicons name="trash-outline" size={22} color={c.danger} />
        </Pressable>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    padding: 16,
    ...theme.shadow.card,
  },
  check: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 2,
    borderColor: '#C5CEC6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { fontSize: 17, lineHeight: 22, fontWeight: '700', },
  sub: { fontSize: 13, marginTop: 3 },
  streak: { flexDirection: 'row', alignItems: 'center', gap: 3, borderRadius: 12, paddingHorizontal: 8, paddingVertical: 5 },
  streakText: { fontWeight: '800', fontSize: 14 },
  actions: { flexDirection: 'row', gap: 6 },
  iconBtn: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
});
