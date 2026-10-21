import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { addDays, toISODate } from '@/lib/dates';
import { supabase } from '@/lib/supabase';
import type { Frequency, Habit, HabitLog, HabitsData } from '@/lib/types';
import { useAuth } from '@/providers/AuthProvider';

// Janela de logs carregada (limita o streak máximo exibido e evita o limite de 1000 linhas da API).
const LOG_WINDOW_DAYS = 120;

const useKey = () => {
  const { session } = useAuth();
  return ['habits', session?.user.id] as const;
};

export function useHabits() {
  const key = useKey();
  return useQuery({
    queryKey: key,
    enabled: !!key[1],
    queryFn: async (): Promise<HabitsData> => {
      const since = toISODate(addDays(new Date(), -LOG_WINDOW_DAYS));
      const [h, l] = await Promise.all([
        supabase.from('habits').select('*').eq('archived', false).order('created_at'),
        supabase.from('habit_logs').select('habit_id, log_date').gte('log_date', since),
      ]);
      if (h.error) throw h.error;
      if (l.error) throw l.error;
      return { habits: h.data as Habit[], logs: l.data as HabitLog[] };
    },
  });
}

export function useToggleLog() {
  const qc = useQueryClient();
  const key = useKey();
  const { session } = useAuth();

  return useMutation({
    mutationFn: async (v: { habitId: string; date: string; done: boolean }) => {
      const { error } = v.done
        ? await supabase
            .from('habit_logs')
            .upsert(
              { habit_id: v.habitId, user_id: session?.user.id, log_date: v.date },
              { onConflict: 'habit_id,log_date', ignoreDuplicates: true },
            )
        : await supabase.from('habit_logs').delete().eq('habit_id', v.habitId).eq('log_date', v.date);
      if (error) throw error;
    },
    // Atualização otimista: o checkbox responde na hora.
    onMutate: async (v) => {
      await qc.cancelQueries({ queryKey: key });
      const prev = qc.getQueryData<HabitsData>(key);
      if (prev) {
        const others = prev.logs.filter((l) => !(l.habit_id === v.habitId && l.log_date === v.date));
        qc.setQueryData<HabitsData>(key, {
          ...prev,
          logs: v.done ? [...others, { habit_id: v.habitId, log_date: v.date }] : others,
        });
      }
      return { prev };
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.prev) qc.setQueryData(key, ctx.prev);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: key }),
  });
}

export function useSaveHabit() {
  const qc = useQueryClient();
  const key = useKey();
  return useMutation({
    mutationFn: async (v: {
      id?: string;
      title: string;
      frequency: Frequency;
      weekly_target: number;
      reminder_time?: string | null;
    }) => {
      const { id, ...fields } = v;
      const { error } = id
        ? await supabase.from('habits').update(fields).eq('id', id)
        : await supabase.from('habits').insert(fields); // user_id vem de auth.uid() no banco
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: key }),
  });
}

export function useDeleteHabit() {
  const qc = useQueryClient();
  const key = useKey();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('habits').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: key }),
  });
}
