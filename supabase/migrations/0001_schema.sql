-- =====================================================================
-- 0001_schema.sql — Modelo de datos base
-- App de aprendizaje de aymara. Postgres / Supabase.
-- =====================================================================

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------
-- TIPOS
-- ---------------------------------------------------------------------

create type public.exercise_type as enum (
  'multiple_choice',
  'listen_and_choose',
  'listen_and_type',
  'translate_to_aymara',
  'word_order',
  'match_pairs',
  'look_and_type'      -- muestra exercises.image_url, el usuario escribe la palabra aymara
);

create type public.progress_status as enum (
  'locked',
  'unlocked',
  'in_progress',
  'completed'
);

create type public.translation_source as enum (
  'dictionary',   -- vino de la tabla vocabulary: confiable
  'ai',           -- generada por LLM: aproximada
  'community'     -- corregida y aprobada: confiable
);

create type public.suggestion_status as enum ('pending', 'approved', 'rejected');

create type public.tutor_role as enum ('user', 'assistant');

-- ---------------------------------------------------------------------
-- USUARIOS
-- ---------------------------------------------------------------------

create table public.profiles (
  id                  uuid primary key references auth.users(id) on delete cascade,
  username            text unique check (char_length(username) between 3 and 24),
  full_name           text,
  avatar_url          text,
  xp_total            integer     not null default 0 check (xp_total >= 0),
  current_streak      integer     not null default 0 check (current_streak >= 0),
  longest_streak      integer     not null default 0 check (longest_streak >= 0),
  last_activity_date  date,
  daily_goal_xp       integer     not null default 30 check (daily_goal_xp > 0),
  onboarding_done     boolean     not null default false,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

comment on table public.profiles is
  'Perfil público del usuario. Se crea automáticamente por trigger al registrarse.';

-- ---------------------------------------------------------------------
-- CONTENIDO DEL CURSO (solo lectura para el usuario)
-- ---------------------------------------------------------------------

create table public.levels (
  id            uuid primary key default gen_random_uuid(),
  order_index   smallint not null unique check (order_index between 1 and 5),
  code          text     not null unique,                -- 'n1', 'n2', ...
  title_es      text     not null,
  title_ay      text,
  description_es text,
  icon          text,
  color_hex     text     not null default '#1CB0F6',
  is_published  boolean  not null default true,
  created_at    timestamptz not null default now()
);

create table public.lessons (
  id            uuid primary key default gen_random_uuid(),
  level_id      uuid     not null references public.levels(id) on delete cascade,
  order_index   smallint not null check (order_index between 1 and 4),
  title_es      text     not null,
  title_ay      text,
  objective_es  text,                                     -- "Al terminar sabrás saludar"
  cultural_note text,                                     -- DIFERENCIADOR C
  xp_reward     smallint not null default 20 check (xp_reward > 0),
  estimated_minutes smallint not null default 5,
  is_published  boolean  not null default true,
  created_at    timestamptz not null default now(),
  unique (level_id, order_index)
);

create table public.vocabulary (
  id            uuid primary key default gen_random_uuid(),
  aymara        text not null,
  spanish       text not null,
  phonetic      text,                    -- guía de lectura en grafía castellana
  part_of_speech text,                   -- 'sustantivo', 'verbo', 'saludo', 'frase'
  audio_url     text,                    -- Supabase Storage; NULL => usar fallback TTS
  image_url     text,
  level_id      uuid references public.levels(id)  on delete set null,
  lesson_id     uuid references public.lessons(id) on delete set null,
  cultural_note text,
  is_verified   boolean not null default false,  -- validado por hablante nativo
  created_at    timestamptz not null default now(),
  unique (aymara, spanish)
);

comment on column public.vocabulary.is_verified is
  'FALSE = traducción tomada de fuente secundaria, pendiente de validar con hablante nativo. La UI del traductor no la marca como verificada.';

create index idx_vocabulary_lesson on public.vocabulary(lesson_id);
create index idx_vocabulary_level  on public.vocabulary(level_id);
create index idx_vocabulary_search on public.vocabulary
  using gin (to_tsvector('simple', coalesce(aymara,'') || ' ' || coalesce(spanish,'')));

create table public.exercises (
  id            uuid primary key default gen_random_uuid(),
  lesson_id     uuid references public.lessons(id) on delete cascade,
  level_id      uuid not null references public.levels(id) on delete cascade,
  vocabulary_id uuid references public.vocabulary(id) on delete set null,
  type          public.exercise_type not null,
  order_index   smallint not null default 0,
  prompt_es     text,                    -- enunciado mostrado al usuario
  prompt_ay     text,
  correct_answer text not null,          -- respuesta canónica (ya normalizada al comparar)
  audio_url     text,
  image_url     text,
  tokens        jsonb,                   -- word_order: ["Juan","sutixa"] | match_pairs: [{"es":"agua","ay":"uma"}]
  hint          text,
  explanation   text,                    -- se muestra tras responder
  difficulty    smallint not null default 1 check (difficulty between 1 and 3),
  is_exam_pool  boolean  not null default false,  -- disponible para el examen del nivel
  created_at    timestamptz not null default now(),
  constraint exercise_has_owner check (lesson_id is not null or is_exam_pool)
);

create index idx_exercises_lesson on public.exercises(lesson_id, order_index);
create index idx_exercises_pool   on public.exercises(level_id) where is_exam_pool;

-- Opciones normalizadas para multiple_choice y listen_and_choose
create table public.exercise_options (
  id           uuid primary key default gen_random_uuid(),
  exercise_id  uuid not null references public.exercises(id) on delete cascade,
  label        text not null,
  is_correct   boolean not null default false,
  order_index  smallint not null default 0,
  image_url    text
);

create index idx_exercise_options on public.exercise_options(exercise_id);

create table public.exams (
  id                  uuid primary key default gen_random_uuid(),
  level_id            uuid not null unique references public.levels(id) on delete cascade,
  title_es            text not null,
  question_count      smallint not null default 10 check (question_count between 5 and 20),
  passing_score       smallint not null default 70 check (passing_score between 50 and 100),
  time_limit_seconds  integer,
  max_attempts_per_day smallint not null default 3
);

comment on table public.exams is
  'Las preguntas NO se guardan aquí: se sortean de exercises WHERE is_exam_pool AND level_id = X mediante get_exam_questions().';

-- ---------------------------------------------------------------------
-- PROGRESO DEL USUARIO
-- ---------------------------------------------------------------------

create table public.user_level_progress (
  user_id         uuid not null references auth.users(id) on delete cascade,
  level_id        uuid not null references public.levels(id) on delete cascade,
  status          public.progress_status not null default 'locked',
  best_exam_score smallint check (best_exam_score between 0 and 100),
  unlocked_at     timestamptz,
  completed_at    timestamptz,
  primary key (user_id, level_id)
);

create table public.user_lesson_progress (
  user_id         uuid not null references auth.users(id) on delete cascade,
  lesson_id       uuid not null references public.lessons(id) on delete cascade,
  status          public.progress_status not null default 'locked',
  best_score      smallint not null default 0 check (best_score between 0 and 100),
  attempts        smallint not null default 0,
  last_attempt_at timestamptz,
  completed_at    timestamptz,
  primary key (user_id, lesson_id)
);

create index idx_lesson_progress_user on public.user_lesson_progress(user_id);

create table public.lesson_attempts (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  lesson_id     uuid not null references public.lessons(id) on delete cascade,
  correct_count smallint not null default 0,
  total_count   smallint not null default 0,
  score         smallint check (score between 0 and 100),
  xp_earned     smallint not null default 0,
  started_at    timestamptz not null default now(),
  finished_at   timestamptz
);

create index idx_lesson_attempts_user on public.lesson_attempts(user_id, lesson_id);

create table public.exam_attempts (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  exam_id       uuid not null references public.exams(id) on delete cascade,
  correct_count smallint not null default 0,
  total_count   smallint not null default 0,
  score         smallint check (score between 0 and 100),
  passed        boolean  not null default false,
  started_at    timestamptz not null default now(),
  finished_at   timestamptz
);

create index idx_exam_attempts_user on public.exam_attempts(user_id, exam_id, started_at desc);

create table public.exercise_answers (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references auth.users(id) on delete cascade,
  exercise_id     uuid not null references public.exercises(id) on delete cascade,
  lesson_attempt_id uuid references public.lesson_attempts(id) on delete cascade,
  exam_attempt_id   uuid references public.exam_attempts(id)   on delete cascade,
  user_answer     text,
  is_correct      boolean not null,
  answered_at     timestamptz not null default now(),
  constraint answer_has_context check (
    lesson_attempt_id is not null or exam_attempt_id is not null
  )
);

create index idx_exercise_answers_user on public.exercise_answers(user_id, exercise_id);

-- Memoria de vocabulario: alimenta el repaso (F10) y el tutor IA (F7)
create table public.user_vocabulary (
  user_id       uuid not null references auth.users(id) on delete cascade,
  vocabulary_id uuid not null references public.vocabulary(id) on delete cascade,
  times_seen    integer not null default 0,
  times_correct integer not null default 0,
  strength      smallint not null default 0 check (strength between 0 and 5),
  next_review_at timestamptz not null default now(),
  first_seen_at timestamptz not null default now(),
  primary key (user_id, vocabulary_id)
);

create index idx_user_vocabulary_review on public.user_vocabulary(user_id, next_review_at);

-- Actividad diaria: base del cálculo de racha, y de la gráfica del perfil
create table public.daily_activity (
  user_id            uuid not null references auth.users(id) on delete cascade,
  activity_date      date not null,
  xp_earned          integer  not null default 0,
  lessons_completed  smallint not null default 0,
  exercises_answered smallint not null default 0,
  primary key (user_id, activity_date)
);

-- ---------------------------------------------------------------------
-- TRADUCTOR (DIFERENCIADOR B)
-- ---------------------------------------------------------------------

create table public.translations (
  id           uuid primary key default gen_random_uuid(),
  source_lang  char(2) not null check (source_lang in ('es','ay')),
  target_lang  char(2) not null check (target_lang in ('es','ay')),
  source_text  text not null,
  source_key   text not null,   -- normalizado por normalize_text(); lo llena la Edge Function
  target_text  text not null,
  source       public.translation_source not null default 'ai',
  confidence   smallint not null default 50 check (confidence between 0 and 100),
  usage_count  integer  not null default 1,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  constraint different_langs check (source_lang <> target_lang),
  unique (source_key, source_lang, target_lang)
);

comment on table public.translations is
  'Caché de traducciones. Evita volver a llamar al LLM por el mismo texto: es el mayor ahorro de costo de la app.';

create table public.translation_suggestions (
  id             uuid primary key default gen_random_uuid(),
  translation_id uuid not null references public.translations(id) on delete cascade,
  user_id        uuid references auth.users(id) on delete set null,
  suggested_text text not null,
  comment        text,
  upvotes        integer not null default 0,
  status         public.suggestion_status not null default 'pending',
  created_at     timestamptz not null default now(),
  unique (translation_id, user_id)
);

-- ---------------------------------------------------------------------
-- TUTOR IA (DIFERENCIADOR A)
-- ---------------------------------------------------------------------

create table public.tutor_sessions (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  title       text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table public.tutor_messages (
  id          uuid primary key default gen_random_uuid(),
  session_id  uuid not null references public.tutor_sessions(id) on delete cascade,
  user_id     uuid not null references auth.users(id) on delete cascade,
  role        public.tutor_role not null,
  content     text not null,
  content_translation text,     -- traducción al español de lo que dijo el tutor
  created_at  timestamptz not null default now()
);

create index idx_tutor_messages_session on public.tutor_messages(session_id, created_at);

-- ---------------------------------------------------------------------
-- LOGROS (opcional, contenido estático)
-- ---------------------------------------------------------------------

create table public.achievements (
  id              uuid primary key default gen_random_uuid(),
  code            text not null unique,
  title_es        text not null,
  description_es  text not null,
  icon            text,
  condition_type  text not null check (condition_type in ('xp','streak','lessons','levels','words')),
  condition_value integer not null
);

create table public.user_achievements (
  user_id        uuid not null references auth.users(id) on delete cascade,
  achievement_id uuid not null references public.achievements(id) on delete cascade,
  unlocked_at    timestamptz not null default now(),
  primary key (user_id, achievement_id)
);

-- ---------------------------------------------------------------------
-- updated_at automático
-- ---------------------------------------------------------------------

create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_profiles_touch        before update on public.profiles
  for each row execute function public.touch_updated_at();
create trigger trg_translations_touch    before update on public.translations
  for each row execute function public.touch_updated_at();
create trigger trg_tutor_sessions_touch  before update on public.tutor_sessions
  for each row execute function public.touch_updated_at();
