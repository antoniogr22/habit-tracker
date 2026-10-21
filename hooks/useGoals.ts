import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Goal } from '@/lib/types';
import { useAuth } from '@/providers/AuthProvider';

const useKey = () => {
  const { session } = useAuth();
  return ['goals', session?.user.id] as const;
};

export function useGoals() {
  const key = useKey();
  return useQuery({
    queryKey: key,
    enabled: !!key[1],
    queryFn: async () => {
      const { data, error } = await supabase.from('goals').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data as Goal[];
    },
  });
}

export interface GoalInput {
  id?: string;
  title: string;
  unit: string | null;
  target_value: number;
  current_value: number;
  deadline: string | null;
}

export function useSaveGoal() {
  const qc = useQueryClient();
  const key = useKey();
  return useMutation({
    mutationFn: async (v: GoalInput) => {
      const { id, ...fields } = v;
      const payload = { ...fields, completed_at: v.current_value >= v.target_value ? new Date().toISOString() : null };
      const { error } = id
        ? await supabase.from('goals').update(payload).eq('id', id)
        : await supabase.from('goals').insert(payload);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: key }),
  });
}

export function useAddProgress() {
  const save = useSaveGoal();
  return {
    ...save,
    mutateAsync: (goal: Goal, amount: number) =>
      save.mutateAsync({
        id: goal.id,
        title: goal.title,
        unit: goal.unit,
        target_value: goal.target_value,
        current_value: goal.current_value + amount,
        deadline: goal.deadline,
      }),
    isPending: save.isPending,
  };
}

export function useDeleteGoal() {
  const qc = useQueryClient();
  const key = useKey();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('goals').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: key }),
  });
}
