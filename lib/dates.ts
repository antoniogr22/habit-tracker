import type { Habit } from './types';

export const toISODate = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

export const today = () => toISODate(new Date());

export const parseISO = (s: string) => {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
};

export const addDays = (d: Date, n: number) => {
  const x = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  x.setDate(x.getDate() + n);
  return x;
};

/** Segunda-feira da semana de `d`. */
export const startOfWeek = (d: Date) => addDays(d, -((d.getDay() + 6) % 7));

export const formatBR = (iso: string) => parseISO(iso).toLocaleDateString('pt-BR');

export const daysUntil = (iso: string) =>
  Math.ceil((parseISO(iso).getTime() - parseISO(today()).getTime()) / 86_400_000);

export const countInWeek = (dates: Set<string>, weekStart: Date) => {
  let c = 0;
  for (let i = 0; i < 7; i++) if (dates.has(toISODate(addDays(weekStart, i)))) c++;
  return c;
};

/**
 * Streak:
 *  - diário: dias consecutivos até hoje (se hoje ainda não foi feito, conta a partir de ontem)
 *  - semanal: semanas consecutivas que atingiram a meta (a semana atual só conta se já atingiu)
 */
export function calcStreak(habit: Habit, dates: Set<string>): number {
  const now = new Date();
  let n = 0;

  if (habit.frequency === 'daily') {
    let cursor = dates.has(toISODate(now)) ? now : addDays(now, -1);
    while (dates.has(toISODate(cursor))) {
      n++;
      cursor = addDays(cursor, -1);
    }
    return n;
  }

  let start = startOfWeek(now);
  if (countInWeek(dates, start) < habit.weekly_target) start = addDays(start, -7);
  while (countInWeek(dates, start) >= habit.weekly_target) {
    n++;
    start = addDays(start, -7);
  }
  return n;
}
