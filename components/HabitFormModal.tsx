import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Button, ErrorText, Field, Sheet } from '@/components/ui';
import { useDeleteHabit, useSaveHabit } from '@/hooks/useHabits';
import { confirmAction } from '@/lib/confirm';
import { theme } from '@/lib/theme';
import { useTheme } from '@/providers/ThemeProvider';
import type { Frequency, Habit } from '@/lib/types';

interface Props { visible: boolean; habit: Habit | null; onClose: () => void }

const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

/** Digitou "0730" → "07:30". */
const maskTime = (raw: string) => {
  const d = raw.replace(/\D/g, '').slice(0, 4);
  return d.length > 2 ? `${d.slice(0, 2)}:${d.slice(2)}` : d;
};

export function HabitFormModal({ visible, habit, onClose }: Props) {
  const { colors: c } = useTheme();
  const save = useSaveHabit();
  const del = useDeleteHabit();
  const [title, setTitle] = useState('');
  const [frequency, setFrequency] = useState<Frequency>('daily');
  const [target, setTarget] = useState(3);
  const [time, setTime] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!visible) return;
    setTitle(habit?.title ?? '');
    setFrequency(habit?.frequency ?? 'daily');
    setTarget(habit?.weekly_target ?? 3);
    setTime(habit?.reminder_time ? habit.reminder_time.slice(0, 5) : '');
    setError(null);
  }, [visible, habit]);

  const submit = async () => {
    if (!title.trim()) return setError('Dê um nome ao hábito.');
    if (time && !TIME_RE.test(time)) return setError('Use o horário no formato HH:MM (ex.: 07:30).');
    try {
      await save.mutateAsync({
        id: habit?.id,
        title: title.trim(),
        frequency,
        weekly_target: frequency === 'weekly' ? target : 1,
        reminder_time: time || null,
      });
      onClose();
    } catch (e: any) {
      setError(e.message ?? 'Não foi possível salvar.');
    }
  };

  const remove = () =>
    confirmAction('Excluir este hábito e todo o histórico dele?', async () => {
      if (!habit) return;
      await del.mutateAsync(habit.id);
      onClose();
    });

  return (
    <Sheet visible={visible} onClose={onClose} title={habit ? 'Editar hábito' : 'Novo hábito'}>
      <Field label="Nome" value={title} onChangeText={setTitle} placeholder="Ex.: Beber 2L de água" maxLength={80} />
      <View style={{ gap: 6 }}>
        <Text style={[s.label, { color: c.muted }]}>Frequência</Text>
        <View style={s.segment}>
          {(['daily', 'weekly'] as const).map((f) => (
            <Pressable key={f} onPress={() => setFrequency(f)} style={[s.seg, { borderColor: c.line, backgroundColor: frequency === f ? c.primary : c.surface }]}>
              <Text style={[s.segText, { color: frequency === f ? '#fff' : c.ink }]}>{f === 'daily' ? 'Diário' : 'Semanal'}</Text>
            </Pressable>
          ))}
        </View>
      </View>
      {frequency === 'weekly' && (
        <View style={{ gap: 6 }}>
          <Text style={[s.label, { color: c.muted }]}>Vezes por semana</Text>
          <View style={s.segment}>
            {[1, 2, 3, 4, 5, 6, 7].map((n) => (
              <Pressable key={n} onPress={() => setTarget(n)} style={[s.seg, { borderColor: c.line, backgroundColor: target === n ? c.primary : c.surface }]}>
                <Text style={[s.segText, { color: target === n ? '#fff' : c.ink }]}>{n}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      )}
      <Field
        label="Horário (opcional)"
        value={time}
        onChangeText={(t) => setTime(maskTime(t))}
        placeholder="07:30"
        keyboardType="number-pad"
        maxLength={5}
      />
      <ErrorText message={error} />
      <Button label="Salvar" onPress={submit} loading={save.isPending} />
      {habit && <Button label="Excluir hábito" variant="danger" onPress={remove} loading={del.isPending} />}
      <Button label="Cancelar" variant="ghost" onPress={onClose} />
    </Sheet>
  );
}

const s = StyleSheet.create({
  label: { fontSize: 13, fontWeight: '500' },
  segment: { flexDirection: 'row', gap: 6 },
  seg: { flex: 1, minHeight: 40, alignItems: 'center', justifyContent: 'center', borderRadius: theme.radius.sm, borderWidth: 1 },
  segText: { fontWeight: '600',  },
});
