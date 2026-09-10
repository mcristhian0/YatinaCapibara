-- =====================================================================
-- 0002_functions.sql — Lógica de negocio en la base de datos
-- El cliente NUNCA escribe xp, racha ni desbloqueos directamente.
-- =====================================================================

-- ---------------------------------------------------------------------
-- Normalización de texto para comparar respuestas y cachear traducciones
-- ---------------------------------------------------------------------
create or replace function public.normalize_text(p_text text)
returns text
language sql immutable strict
as $$
  select btrim(regexp_replace(
           translate(lower(p_text), 'áéíóúàèìòùäëïöüâêîôû', 'aeiouaeiouaeiouaeiou'),
           '[^a-z0-9'' ]', '', 'g'
         ));
$$;

comment on function public.normalize_text is
  'Minúsculas, sin tildes del español, sin puntuación. Conserva el apóstrofo de las glotalizadas y los espacios internos.';

-- Comparación tolerante usada por la app para calificar texto libre.
-- Acepta la respuesta con o sin apóstrofo y con o sin diéresis.
create or replace function public.answer_matches(p_user_answer text, p_correct text)
returns boolean
language sql immutable
as $$
  select case
    when p_user_answer is null then false
    else public.normalize_text(p_user_answer) = public.normalize_text(p_correct)
      or replace(public.normalize_text(p_user_answer), '''', '')
         = replace(public.normalize_text(p_correct), '''', '')
  end;
$$;

-- ---------------------------------------------------------------------
-- Alta de usuario: crea perfil y desbloquea nivel 1 / lección 1
-- ---------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql security definer set search_path = public
as $$
declare
  v_level_id  uuid;
  v_lesson_id uuid;
begin
  insert into public.profiles (id, full_name, username)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.raw_user_meta_data->>'username', 'user_' || left(new.id::text, 8))
  );

  select id into v_level_id from public.levels where order_index = 1;
  if v_level_id is not null then
    insert into public.user_level_progress (user_id, level_id, status, unlocked_at)
    values (new.id, v_level_id, 'unlocked', now());

    select id into v_lesson_id
      from public.lessons
     where level_id = v_level_id and order_index = 1;

    if v_lesson_id is not null then
      insert into public.user_lesson_progress (user_id, lesson_id, status)
      values (new.id, v_lesson_id, 'unlocked');
    end if;
  end if;

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------
-- XP + racha + actividad diaria (interno)
-- ---------------------------------------------------------------------
create or replace function public.register_activity(
  p_user_id   uuid,
  p_xp        integer,
  p_lessons   smallint default 0,
  p_exercises smallint default 0
)
returns void
language plpgsql security definer set search_path = public
as $$
declare
  v_today date := current_date;
  v_last  date;
  v_streak integer;
begin
  insert into public.daily_activity (user_id, activity_date, xp_earned, lessons_completed, exercises_answered)
  values (p_user_id, v_today, greatest(p_xp, 0), p_lessons, p_exercises)
  on conflict (user_id, activity_date) do update
    set xp_earned          = public.daily_activity.xp_earned + greatest(p_xp, 0),
        lessons_completed  = public.daily_activity.lessons_completed + p_lessons,
        exercises_answered = public.daily_activity.exercises_answered + p_exercises;

  select last_activity_date, current_streak
    into v_last, v_streak
    from public.profiles where id = p_user_id
    for update;

  if v_last is null or v_last < v_today - 1 then
    v_streak := 1;                         -- racha rota o primera vez
  elsif v_last = v_today - 1 then
    v_streak := v_streak + 1;              -- día consecutivo
  end if;                                  -- si v_last = hoy, la racha no cambia

  update public.profiles
     set xp_total           = xp_total + greatest(p_xp, 0),
         current_streak     = v_streak,
         longest_streak     = greatest(longest_streak, v_streak),
         last_activity_date = v_today
   where id = p_user_id;
end;
$$;

-- ---------------------------------------------------------------------
-- Refuerzo de memoria de vocabulario (interno)
-- ---------------------------------------------------------------------
create or replace function public.reinforce_vocabulary(
  p_user_id uuid,
  p_vocabulary_id uuid,
  p_correct boolean
)
returns void
language plpgsql security definer set search_path = public
as $$
begin
  if p_vocabulary_id is null then return; end if;

  insert into public.user_vocabulary (user_id, vocabulary_id, times_seen, times_correct, strength, next_review_at)
  values (
    p_user_id, p_vocabulary_id, 1,
    case when p_correct then 1 else 0 end,
    case when p_correct then 1 else 0 end,
    now() + case when p_correct then interval '1 day' else interval '4 hours' end
  )
  on conflict (user_id, vocabulary_id) do update set
    times_seen    = public.user_vocabulary.times_seen + 1,
    times_correct = public.user_vocabulary.times_correct + case when p_correct then 1 else 0 end,
    strength      = case
                      when p_correct then least(public.user_vocabulary.strength + 1, 5)
                      else greatest(public.user_vocabulary.strength - 1, 0)
                    end,
    -- repetición espaciada simple: 4h, 1d, 3d, 7d, 15d, 30d
    next_review_at = now() + (array[
      interval '4 hours', interval '1 day', interval '3 days',
      interval '7 days',  interval '15 days', interval '30 days'
    ])[ (case
           when p_correct then least(public.user_vocabulary.strength + 1, 5)
           else greatest(public.user_vocabulary.strength - 1, 0)
         end) + 1 ];
end;
$$;

-- ---------------------------------------------------------------------
-- RPC: iniciar una lección
-- ---------------------------------------------------------------------
create or replace function public.start_lesson(p_lesson_id uuid)
returns uuid
language plpgsql security definer set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_status public.progress_status;
  v_attempt uuid;
begin
  if v_user is null then raise exception 'AUTH_REQUIRED'; end if;

  select status into v_status
    from public.user_lesson_progress
   where user_id = v_user and lesson_id = p_lesson_id;

  if v_status is null or v_status = 'locked' then
    raise exception 'LESSON_LOCKED';
  end if;

  insert into public.lesson_attempts (user_id, lesson_id)
  values (v_user, p_lesson_id)
  returning id into v_attempt;

  return v_attempt;
end;
$$;

-- ---------------------------------------------------------------------
-- RPC: terminar una lección
-- p_answers: [{"exercise_id":"uuid","user_answer":"uma","is_correct":true,"vocabulary_id":"uuid"}, ...]
-- ---------------------------------------------------------------------
create or replace function public.complete_lesson(
  p_attempt_id uuid,
  p_answers    jsonb
)
returns jsonb
language plpgsql security definer set search_path = public
as $$
declare
  v_user       uuid := auth.uid();
  v_attempt    record;
  v_lesson     record;
  v_total      smallint;
  v_correct    smallint;
  v_score      smallint;
  v_prev_best  smallint;
  v_xp         smallint;
  v_passed     boolean;
  v_next_lesson uuid;
  v_exam_ready boolean := false;
  v_ans        jsonb;
begin
  if v_user is null then raise exception 'AUTH_REQUIRED'; end if;

  select * into v_attempt from public.lesson_attempts
   where id = p_attempt_id and user_id = v_user;
  if not found then raise exception 'ATTEMPT_NOT_FOUND'; end if;
  if v_attempt.finished_at is not null then raise exception 'ATTEMPT_ALREADY_CLOSED'; end if;

  select * into v_lesson from public.lessons where id = v_attempt.lesson_id;

  v_total   := jsonb_array_length(p_answers);
  if v_total = 0 then raise exception 'NO_ANSWERS'; end if;

  v_correct := 0;

  for v_ans in select * from jsonb_array_elements(p_answers) loop
    insert into public.exercise_answers
      (user_id, exercise_id, lesson_attempt_id, user_answer, is_correct)
    values (
      v_user,
      (v_ans->>'exercise_id')::uuid,
      p_attempt_id,
      v_ans->>'user_answer',
      coalesce((v_ans->>'is_correct')::boolean, false)
    );

    if coalesce((v_ans->>'is_correct')::boolean, false) then
      v_correct := v_correct + 1;
    end if;

    perform public.reinforce_vocabulary(
      v_user,
      nullif(v_ans->>'vocabulary_id','')::uuid,
      coalesce((v_ans->>'is_correct')::boolean, false)
    );
  end loop;

  v_score  := round((v_correct::numeric / v_total) * 100);
  v_passed := v_score >= 60;

  select best_score into v_prev_best
    from public.user_lesson_progress
   where user_id = v_user and lesson_id = v_lesson.id;

  -- XP completo la primera vez; 30% en repasos
  if coalesce(v_prev_best, 0) < 60 then
    v_xp := greatest(1, round(v_lesson.xp_reward * v_score / 100.0));
  else
    v_xp := greatest(1, round(v_lesson.xp_reward * 0.3));
  end if;

  update public.lesson_attempts
     set correct_count = v_correct,
         total_count   = v_total,
         score         = v_score,
         xp_earned     = v_xp,
         finished_at   = now()
   where id = p_attempt_id;

  insert into public.user_lesson_progress
      (user_id, lesson_id, status, best_score, attempts, last_attempt_at, completed_at)
  values (
    v_user, v_lesson.id,
    (case when v_passed then 'completed' else 'in_progress' end)::public.progress_status,
    v_score, 1, now(),
    case when v_passed then now() else null end
  )
  on conflict (user_id, lesson_id) do update set
    best_score      = greatest(public.user_lesson_progress.best_score, excluded.best_score),
    attempts        = public.user_lesson_progress.attempts + 1,
    last_attempt_at = now(),
    status          = case
                        when public.user_lesson_progress.status = 'completed' or v_passed
                        then 'completed'::public.progress_status
                        else 'in_progress'::public.progress_status
                      end,
    completed_at    = coalesce(public.user_lesson_progress.completed_at,
                               case when v_passed then now() end);

  perform public.register_activity(
    v_user, v_xp,
    case when v_passed then 1 else 0 end::smallint,
    v_total
  );

  -- Desbloquear la siguiente lección del nivel
  if v_passed then
    select id into v_next_lesson
      from public.lessons
     where level_id = v_lesson.level_id
       and order_index = v_lesson.order_index + 1
       and is_published;

    if v_next_lesson is not null then
      insert into public.user_lesson_progress (user_id, lesson_id, status)
      values (v_user, v_next_lesson, 'unlocked')
      on conflict (user_id, lesson_id) do update set
        status = case when public.user_lesson_progress.status = 'locked'
                      then 'unlocked'::public.progress_status
                      else public.user_lesson_progress.status end;
    end if;

    -- ¿Ya completó las 4 lecciones del nivel? => examen disponible
    select not exists (
      select 1 from public.lessons l
       where l.level_id = v_lesson.level_id and l.is_published
         and not exists (
           select 1 from public.user_lesson_progress p
            where p.user_id = v_user and p.lesson_id = l.id and p.status = 'completed'
         )
    ) into v_exam_ready;
  end if;

  return jsonb_build_object(
    'score', v_score,
    'correct', v_correct,
    'total', v_total,
    'passed', v_passed,
    'xp_earned', v_xp,
    'next_lesson_id', v_next_lesson,
    'exam_unlocked', v_exam_ready
  );
end;
$$;

-- ---------------------------------------------------------------------
-- RPC: obtener las preguntas del examen (sorteo aleatorio del pool)
-- ---------------------------------------------------------------------
create or replace function public.get_exam_questions(p_exam_id uuid)
returns setof public.exercises
language plpgsql security definer set search_path = public
as $$
declare
  v_user  uuid := auth.uid();
  v_exam  record;
  v_today_attempts smallint;
begin
  if v_user is null then raise exception 'AUTH_REQUIRED'; end if;

  select * into v_exam from public.exams where id = p_exam_id;
  if not found then raise exception 'EXAM_NOT_FOUND'; end if;

  -- El examen exige tener las 4 lecciones del nivel completadas
  if exists (
    select 1 from public.lessons l
     where l.level_id = v_exam.level_id and l.is_published
       and not exists (
         select 1 from public.user_lesson_progress p
          where p.user_id = v_user and p.lesson_id = l.id and p.status = 'completed'
       )
  ) then
    raise exception 'LESSONS_INCOMPLETE';
  end if;

  select count(*) into v_today_attempts
    from public.exam_attempts
   where user_id = v_user and exam_id = p_exam_id
     and started_at >= current_date;

  if v_today_attempts >= v_exam.max_attempts_per_day then
    raise exception 'DAILY_ATTEMPT_LIMIT';
  end if;

  return query
    select * from public.exercises
     where level_id = v_exam.level_id and is_exam_pool
     order by random()
     limit v_exam.question_count;
end;
$$;

-- ---------------------------------------------------------------------
-- RPC: entregar el examen
-- ---------------------------------------------------------------------
create or replace function public.submit_exam(
  p_exam_id uuid,
  p_answers jsonb
)
returns jsonb
language plpgsql security definer set search_path = public
as $$
declare
  v_user        uuid := auth.uid();
  v_exam        record;
  v_attempt_id  uuid;
  v_total       smallint;
  v_correct     smallint := 0;
  v_score       smallint;
  v_passed      boolean;
  v_next_level  uuid;
  v_next_lesson uuid;
  v_ans         jsonb;
  v_xp          integer := 0;
begin
  if v_user is null then raise exception 'AUTH_REQUIRED'; end if;

  select * into v_exam from public.exams where id = p_exam_id;
  if not found then raise exception 'EXAM_NOT_FOUND'; end if;

  v_total := jsonb_array_length(p_answers);
  if v_total = 0 then raise exception 'NO_ANSWERS'; end if;

  insert into public.exam_attempts (user_id, exam_id, total_count)
  values (v_user, p_exam_id, v_total)
  returning id into v_attempt_id;

  for v_ans in select * from jsonb_array_elements(p_answers) loop
    insert into public.exercise_answers
      (user_id, exercise_id, exam_attempt_id, user_answer, is_correct)
    values (
      v_user, (v_ans->>'exercise_id')::uuid, v_attempt_id,
      v_ans->>'user_answer', coalesce((v_ans->>'is_correct')::boolean, false)
    );
    if coalesce((v_ans->>'is_correct')::boolean, false) then
      v_correct := v_correct + 1;
    end if;
    perform public.reinforce_vocabulary(
      v_user, nullif(v_ans->>'vocabulary_id','')::uuid,
      coalesce((v_ans->>'is_correct')::boolean, false)
    );
  end loop;

  v_score  := round((v_correct::numeric / v_total) * 100);
  v_passed := v_score >= v_exam.passing_score;
  v_xp     := case when v_passed then 100 else 20 end;

  update public.exam_attempts
     set correct_count = v_correct, score = v_score,
         passed = v_passed, finished_at = now()
   where id = v_attempt_id;

  insert into public.user_level_progress (user_id, level_id, status, best_exam_score, completed_at)
  values (
    v_user, v_exam.level_id,
    (case when v_passed then 'completed' else 'in_progress' end)::public.progress_status,
    v_score,
    case when v_passed then now() end
  )
  on conflict (user_id, level_id) do update set
    best_exam_score = greatest(coalesce(public.user_level_progress.best_exam_score, 0), v_score),
    status = case when v_passed then 'completed'::public.progress_status
                  else public.user_level_progress.status end,
    completed_at = coalesce(public.user_level_progress.completed_at,
                            case when v_passed then now() end);

  perform public.register_activity(v_user, v_xp, 0::smallint, v_total);

  if v_passed then
    select l.id into v_next_level
      from public.levels l
     where l.order_index = (select order_index + 1 from public.levels where id = v_exam.level_id)
       and l.is_published;

    if v_next_level is not null then
      insert into public.user_level_progress (user_id, level_id, status, unlocked_at)
      values (v_user, v_next_level, 'unlocked', now())
      on conflict (user_id, level_id) do update set
        status = case when public.user_level_progress.status = 'locked'
                      then 'unlocked'::public.progress_status
                      else public.user_level_progress.status end,
        unlocked_at = coalesce(public.user_level_progress.unlocked_at, now());

      select id into v_next_lesson
        from public.lessons where level_id = v_next_level and order_index = 1;

      if v_next_lesson is not null then
        insert into public.user_lesson_progress (user_id, lesson_id, status)
        values (v_user, v_next_lesson, 'unlocked')
        on conflict (user_id, lesson_id) do update set
          status = case when public.user_lesson_progress.status = 'locked'
                        then 'unlocked'::public.progress_status
                        else public.user_lesson_progress.status end;
      end if;
    end if;
  end if;

  return jsonb_build_object(
    'score', v_score, 'correct', v_correct, 'total', v_total,
    'passed', v_passed, 'passing_score', v_exam.passing_score,
    'xp_earned', v_xp, 'next_level_id', v_next_level
  );
end;
$$;

-- ---------------------------------------------------------------------
-- RPC: vocabulario que el usuario ya conoce (alimenta el tutor IA)
-- ---------------------------------------------------------------------
create or replace function public.get_learned_vocabulary()
returns table (aymara text, spanish text, part_of_speech text)
language sql security definer set search_path = public stable
as $$
  select v.aymara, v.spanish, v.part_of_speech
    from public.user_vocabulary uv
    join public.vocabulary v on v.id = uv.vocabulary_id
   where uv.user_id = auth.uid()
   order by uv.strength desc, v.aymara;
$$;

-- ---------------------------------------------------------------------
-- RPC: cola de repaso (F10)
-- ---------------------------------------------------------------------
create or replace function public.get_review_queue(p_limit integer default 10)
returns setof public.exercises
language sql security definer set search_path = public stable
as $$
  select e.*
    from public.user_vocabulary uv
    join public.exercises e on e.vocabulary_id = uv.vocabulary_id
   where uv.user_id = auth.uid()
     and uv.next_review_at <= now()
     and uv.strength < 5
   order by uv.next_review_at asc, random()
   limit p_limit;
$$;
