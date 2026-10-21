import { useEffect, useState } from 'react';
import { Button, ErrorText, Field, Sheet } from '@/components/ui';
import { useDeleteGoal, useSaveGoal } from '@/hooks/useGoals';
import { confirmAction } from '@/lib/confirm';
import type { Goal } from '@/lib/types';

interface Props { visible: boolean; goal: Goal | null; onClose: () => void }

const num = (v: string) => Number(v.replace(',', '.'));

export function GoalFormModal({ visible, goal, onClose }: Props) {
  const save = useSaveGoal();
  const del = useDeleteGoal();
  const [title, setTitle] = useState('');
  const [target, setTarget] = useState('');
  const [current, setCurrent] = useState('0');
  const [unit, setUnit] = useState('');
  const [deadline, setDeadline] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!visible) return;
    setTitle(goal?.title ?? '');
    setTarget(goal ? String(goal.target_value) : '');
    setCurrent(goal ? String(goal.current_value) : '0');
    setUnit(goal?.unit ?? '');
    setDeadline(goal?.deadline ?? '');
    setError(null);
  }, [visible, goal]);

  const submit = async () => {
    const t = num(target);
    const c = num(current || '0');
    if (!title.trim()) return setError('Dê um nome à meta.');
    if (!(t > 0)) return setError('O valor alvo deve ser maior que zero.');
    if (!(c >= 0)) return setError('O progresso atual não pode ser negativo.');
    if (deadline && !/^\d{4}-\d{2}-\d{2}$/.test(deadline)) return setError('Use o prazo no formato AAAA-MM-DD.');
    try {
      await save.mutateAsync({
        id: goal?.id,
        title: title.trim(),
        unit: unit.trim() || null,
        target_value: t,
        current_value: c,
        deadline: deadline || null,
      });
      onClose();
    } catch (e: any) {
      setError(e.message ?? 'Não foi possível salvar.');
    }
  };

  const remove = () =>
    confirmAction('Excluir esta meta?', async () => {
      if (!goal) return;
      await del.mutateAsync(goal.id);
      onClose();
    });

  return (
    <Sheet visible={visible} onClose={onClose} title={goal ? 'Editar meta' : 'Nova meta'}>
      <Field label="Nome" value={title} onChangeText={setTitle} placeholder="Ex.: Economizar R$ 1000" maxLength={80} />
      <Field label="Valor alvo" value={target} onChangeText={setTarget} keyboardType="decimal-pad" placeholder="1000" />
      <Field label="Progresso atual" value={current} onChangeText={setCurrent} keyboardType="decimal-pad" />
      <Field label="Unidade (opcional)" value={unit} onChangeText={setUnit} placeholder="R$, km, livros…" maxLength={12} />
      <Field label="Prazo (opcional)" value={deadline} onChangeText={setDeadline} placeholder="2026-12-31" autoCapitalize="none" />
      <ErrorText message={error} />
      <Button label="Salvar" onPress={submit} loading={save.isPending} />
      {goal && <Button label="Excluir meta" variant="danger" onPress={remove} loading={del.isPending} />}
      <Button label="Cancelar" variant="ghost" onPress={onClose} />
    </Sheet>
  );
}
