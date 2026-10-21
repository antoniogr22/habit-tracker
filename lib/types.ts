export type Frequency = 'daily' | 'weekly';

export interface Habit {
  id: string;
  title: string;
  description: string | null;
  frequency: Frequency;
  weekly_target: number;
  reminder_time: string | null; // HH:MM[:SS]
  archived: boolean;
  created_at: string;
}

export interface HabitLog {
  habit_id: string;
  log_date: string; // YYYY-MM-DD
}

export interface HabitsData {
  habits: Habit[];
  logs: HabitLog[];
}

export interface Goal {
  id: string;
  title: string;
  description: string | null;
  unit: string | null;
  target_value: number;
  current_value: number;
  deadline: string | null; // YYYY-MM-DD
  completed_at: string | null;
  created_at: string;
}
