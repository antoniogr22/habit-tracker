import { Ionicons } from '@expo/vector-icons';
import { useRef } from 'react';
import { Animated, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { confirmAction } from '@/lib/confirm';
import { theme } from '@/lib/theme';
import type { Habit } from '@/lib/types';

const c = theme.colors;

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
    <View style={[s.card, doneToday && s.cardDone]}>
      <Animated.View style={{ transform: [{ scale }] }}>
        <Pressable
          accessibilityRole="checkbox"
          accessibilityState={{ checked: doneToday }}
          accessibilityLabel={habit.title}
          onPress={handleToggle}
          style={[s.check, doneToday && s.checkOn]}
        >
          {doneToday && <Ionicons name="checkmark" size={20} color="#fff" />}
        </Pressable>
      </Animated.View>

      <View style={{ flex: 1 }}>
        <Text
          numberOfLines={2}
          style={[s.title, doneToday && { color: c.muted, textDecorationLine: 'line-through' }]}
        >
          {habit.title}
        </Text>
        <Text style={[s.sub, doneToday && { color: c.primary, fontWeight: '600' }]}>{subtitle}</Text>
      </View>

      <View style={s.streak}>
        <Ionicons name="flame" size={16} color={streak > 0 ? c.accent : c.line} />
        <Text style={[s.streakText, streak === 0 && { color: c.muted }]}>
          {streak}{isWeekly ? ' sem' : ' d'}
        </Text>
      </View>

      <View style={s.actions}>
        <Pressable accessibilityLabel={`Editar ${habit.title}`} onPress={onEdit} hitSlop={8} style={s.iconBtn}>
          <Ionicons name="create-outline" size={20} color={c.muted} />
        </Pressable>
        <Pressable accessibilityLabel={`Excluir ${habit.title}`} onPress={handleDelete} hitSlop={8} style={s.iconBtn}>
          <Ionicons name="trash-outline" size={20} color={c.danger} />
        </Pressable>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: c.surface,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: c.line,
    padding: 14,
  },
  cardDone: { backgroundColor: c.primarySoft, borderColor: c.primary },
  check: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 2,
    borderColor: c.line,
    backgroundColor: c.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkOn: { backgroundColor: c.primary, borderColor: c.primary },
  title: { fontSize: 16, fontWeight: '600', color: c.ink },
  sub: { fontSize: 13, color: c.muted, marginTop: 2 },
  streak: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  streakText: { fontWeight: '700', color: c.ink, fontSize: 14 },
  actions: { flexDirection: 'row', gap: 2 },
  iconBtn: { padding: 6 },
});
