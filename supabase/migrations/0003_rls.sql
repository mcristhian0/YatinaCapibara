-- =====================================================================
-- 0003_rls.sql — Row Level Security
-- Regla general:
--   * Contenido del curso  -> lectura para autenticados, escritura solo service_role
--   * Datos del usuario    -> el usuario solo ve y escribe SUS filas
-- =====================================================================

alter table public.profiles              enable row level security;
alter table public.levels                enable row level security;
alter table public.lessons               enable row level security;
alter table public.vocabulary            enable row level security;
alter table public.exercises             enable row level security;
alter table public.exercise_options      enable row level security;
alter table public.exams                 enable row level security;
alter table public.user_level_progress   enable row level security;
alter table public.user_lesson_progress  enable row level security;
alter table public.lesson_attempts       enable row level security;
alter table public.exam_attempts         enable row level security;
alter table public.exercise_answers      enable row level security;
alter table public.user_vocabulary       enable row level security;
alter table public.daily_activity        enable row level security;
alter table public.translations          enable row level security;
alter table public.translation_suggestions enable row level security;
alter table public.tutor_sessions        enable row level security;
alter table public.tutor_messages        enable row level security;
alter table public.achievements          enable row level security;
alter table public.user_achievements     enable row level security;

-- ---------------------------------------------------------------------
-- CONTENIDO: lectura para autenticados
-- ---------------------------------------------------------------------
create policy "content_read_levels"    on public.levels
  for select to authenticated using (is_published);
create policy "content_read_lessons"   on public.lessons
  for select to authenticated using (is_published);
create policy "content_read_vocab"     on public.vocabulary
  for select to authenticated using (true);
create policy "content_read_exams"     on public.exams
  for select to authenticated using (true);
create policy "content_read_achv"      on public.achievements
  for select to authenticated using (true);

-- Los ejercicios del pool de examen NO deben poder listarse libremente
-- (si no, el alumno los lee desde el cliente antes de rendir).
create policy "content_read_exercises" on public.exercises
  for select to authenticated using (not is_exam_pool);

create policy "content_read_options"   on public.exercise_options
  for select to authenticated using (
    exists (
      select 1 from public.exercises e
       where e.id = exercise_options.exercise_id and not e.is_exam_pool
    )
  );

-- Nota: get_exam_questions() es SECURITY DEFINER, así que puede leer el pool
-- aunque la política de arriba lo oculte al cliente. Esa es la intención.

-- ---------------------------------------------------------------------
-- PERFIL
-- ---------------------------------------------------------------------
create policy "profile_select_own" on public.profiles
  for select to authenticated using (auth.uid() = id);
create policy "profile_update_own" on public.profiles
  for update to authenticated using (auth.uid() = id)
  with check (auth.uid() = id);

-- El cliente NO puede tocar xp ni racha: se bloquea con un trigger,
-- porque RLS no filtra por columna.
create or replace function public.protect_profile_columns()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if auth.role() = 'authenticated' then
    new.xp_total           := old.xp_total;
    new.current_streak     := old.current_streak;
    new.longest_streak     := old.longest_streak;
    new.last_activity_date := old.last_activity_date;
  end if;
  return new;
end;
$$;

create trigger trg_protect_profile before update on public.profiles
  for each row execute function public.protect_profile_columns();

-- ---------------------------------------------------------------------
-- PROGRESO: solo lectura desde el cliente. La escritura ocurre en las RPC.
-- ---------------------------------------------------------------------
create policy "level_progress_own" on public.user_level_progress
  for select to authenticated using (auth.uid() = user_id);
create policy "lesson_progress_own" on public.user_lesson_progress
  for select to authenticated using (auth.uid() = user_id);
create policy "lesson_attempts_own" on public.lesson_attempts
  for select to authenticated using (auth.uid() = user_id);
create policy "exam_attempts_own" on public.exam_attempts
  for select to authenticated using (auth.uid() = user_id);
create policy "answers_own" on public.exercise_answers
  for select to authenticated using (auth.uid() = user_id);
create policy "user_vocab_own" on public.user_vocabulary
  for select to authenticated using (auth.uid() = user_id);
create policy "daily_activity_own" on public.daily_activity
  for select to authenticated using (auth.uid() = user_id);
create policy "user_achv_own" on public.user_achievements
  for select to authenticated using (auth.uid() = user_id);

-- ---------------------------------------------------------------------
-- TRADUCTOR
-- ---------------------------------------------------------------------
create policy "translations_read" on public.translations
  for select to authenticated using (true);
-- La escritura en translations la hace la Edge Function con service_role.

create policy "suggestions_read" on public.translation_suggestions
  for select to authenticated using (true);
create policy "suggestions_insert_own" on public.translation_suggestions
  for insert to authenticated with check (auth.uid() = user_id);
create policy "suggestions_update_own" on public.translation_suggestions
  for update to authenticated using (auth.uid() = user_id and status = 'pending')
  with check (auth.uid() = user_id);
create policy "suggestions_delete_own" on public.translation_suggestions
  for delete to authenticated using (auth.uid() = user_id);

-- ---------------------------------------------------------------------
-- TUTOR IA
-- ---------------------------------------------------------------------
create policy "tutor_sessions_own" on public.tutor_sessions
  for all to authenticated using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "tutor_messages_own" on public.tutor_messages
  for all to authenticated using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------
-- Permisos de ejecución de las RPC
-- ---------------------------------------------------------------------
revoke all on function public.register_activity(uuid, integer, smallint, smallint) from public, anon, authenticated;
revoke all on function public.reinforce_vocabulary(uuid, uuid, boolean)            from public, anon, authenticated;
revoke all on function public.protect_profile_columns()                             from public, anon, authenticated;

grant execute on function public.start_lesson(uuid)                 to authenticated;
grant execute on function public.complete_lesson(uuid, jsonb)       to authenticated;
grant execute on function public.get_exam_questions(uuid)           to authenticated;
grant execute on function public.submit_exam(uuid, jsonb)           to authenticated;
grant execute on function public.get_learned_vocabulary()           to authenticated;
grant execute on function public.get_review_queue(integer)          to authenticated;
grant execute on function public.normalize_text(text)               to authenticated;
grant execute on function public.answer_matches(text, text)         to authenticated;
