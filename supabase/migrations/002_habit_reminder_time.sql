-- =====================================================================
-- Migração 002 — horário opcional do hábito
-- Rodar UMA vez no SQL Editor do Supabase (é seguro rodar de novo).
-- Não altera RLS: as políticas existentes de habits já cobrem a coluna.
-- =====================================================================
alter table public.habits
  add column if not exists reminder_time time;

comment on column public.habits.reminder_time is 'Horário sugerido para o hábito (opcional), formato HH:MM';
