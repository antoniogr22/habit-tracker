import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { GoalFormModal } from '@/components/GoalFormModal';
import { Button, Card, ErrorText, ProgressBar, Screen } from '@/components/ui';
import { useAddProgress, useGoals } from '@/hooks/useGoals';
import { daysUntil, formatBR } from '@/lib/dates';
import { theme } from '@/lib/theme';
import type { Goal } from '@/lib/types';

const c = theme.colors;
const fmt = (n: number) => n.toLocaleString('pt-BR', { maximumFractionDigits: 2 });

function GoalCard({ goal, onEdit }: { goal: Goal; onEdit: () => void }) {
  const add = useAddProgress();
  const [amount, setAmount] = useState('');
  const pct = Math.min(100, Math.round((goal.current_value / goal.target_value) * 100));
  const done = goal.current_value >= goal.target_value;
  const left = goal.deadline ? daysUntil(goal.deadline) : null;
  const unit = goal.unit ? ` ${goal.unit}` : '';

  const submit = async () => {
    const v = Number(amount.replace(',', '.'));
    if (!(v > 0)) return;
    await add.mutateAsync(goal, v);
    setAmount('');
  };

  return (
    <Card>
      <Pressable onPress={onEdit} accessibilityLabel={`Editar meta ${goal.title}`}>
        <View style={s.head}>
          <Text style={s.title}>{goal.title}</Text>
          <Text style={[s.pct, done && { color: c.primary }]}>{pct}%</Text>
        </View>
      </Pressable>
      <ProgressBar pct={pct} color={done ? c.primary : c.accent} />
      <Text style={s.sub}>
        {fmt(goal.current_value)} de {fmt(goal.target_value)}{unit}
        {goal.deadline
          ? ` · prazo ${formatBR(goal.deadline)}${left !== null && !done ? (left >= 0 ? ` (${left} dias)` : ' (vencido)') : ''}`
          : ''}
      </Text>
      {done ? (
        <Text style={[s.sub, { color: c.primary, fontWeight: '600' }]}>Meta concluída</Text>
      ) : (
        <View style={s.addRow}>
          <TextInput
            value={amount}
            onChangeText={setAmount}
            keyboardType="decimal-pad"
            placeholder="Adicionar progresso"
            placeholderTextColor={c.muted}
            onSubmitEditing={submit}
            style={s.addInput}
          />
          <View style={{ width: 100 }}>
            <Button label="Somar" onPress={submit} loading={add.isPending} />
          </View>
        </View>
      )}
    </Card>
  );
}

export default function GoalsScreen() {
  const { data, isLoading, error } = useGoals();
  const [editing, setEditing] = useState<Goal | null>(null);
  const [open, setOpen] = useState(false);

  return (
    <Screen>
      {isLoading && <ActivityIndicator color={c.primary} />}
      <ErrorText message={error ? 'Não foi possível carregar suas metas.' : null} />

      {data?.map((g) => (
        <GoalCard key={g.id} goal={g} onEdit={() => { setEditing(g); setOpen(true); }} />
      ))}

      {!isLoading && data?.length === 0 && (
        <Card>
          <Text style={s.title}>Defina sua primeira meta</Text>
          <Text style={s.sub}>Escolha um valor e um prazo, como “Correr 50 km neste mês”.</Text>
        </Card>
      )}

      <Button label="Nova meta" onPress={() => { setEditing(null); setOpen(true); }} />
      <GoalFormModal visible={open} goal={editing} onClose={() => setOpen(false)} />
    </Screen>
  );
}

const s = StyleSheet.create({
  head: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10, gap: 12 },
  title: { flex: 1, fontSize: 17, fontWeight: '700', color: c.ink },
  pct: { fontSize: 20, fontWeight: '800', color: c.ink },
  sub: { fontSize: 13, color: c.muted, marginTop: 8 },
  addRow: { flexDirection: 'row', gap: 8, marginTop: 12, alignItems: 'center' },
  addInput: { flex: 1, minHeight: 46, borderWidth: 1, borderColor: c.line, borderRadius: theme.radius.sm, paddingHorizontal: 12, fontSize: 16, color: c.ink },
});
