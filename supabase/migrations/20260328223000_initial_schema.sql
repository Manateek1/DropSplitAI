create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique,
  first_name text,
  last_name text,
  full_name text,
  avatar_url text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.swimmer_profiles (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  age integer,
  grade_group text,
  skill_level text not null default 'intermediate',
  height_in_inches integer,
  weight_lbs integer,
  favorite_strokes text[] not null default '{}',
  best_events text[] not null default '{}',
  weaknesses text[] not null default '{}',
  weekly_swim_days integer not null default 4,
  pool_access text,
  goals text[] not null default '{}',
  target_events text[] not null default '{}',
  current_training_level text,
  soreness_notes text,
  onboarding_completed boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.swimmer_goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  detail text,
  priority_order integer not null default 1,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.swimmer_best_times (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  event_name text not null,
  course text not null default 'SCY',
  time_display text not null,
  time_seconds numeric(8,2) not null,
  recorded_at date not null,
  note text,
  source text not null default 'manual',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.weekly_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  week_of date not null,
  total_yardage integer not null default 0,
  target_swim_days integer not null default 4,
  stroke_focus text not null,
  coach_summary text not null,
  source text not null default 'ai',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.workout_days (
  id uuid primary key default gen_random_uuid(),
  weekly_plan_id uuid not null references public.weekly_plans(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  day_index integer not null,
  day_label text not null,
  day_date date not null,
  focus text not null,
  intensity text not null,
  stroke_focus text not null,
  total_yardage integer not null default 0,
  coach_note text,
  warmup_json jsonb not null default '[]'::jsonb,
  pre_set_json jsonb not null default '[]'::jsonb,
  main_set_json jsonb not null default '[]'::jsonb,
  kick_json jsonb not null default '[]'::jsonb,
  pull_json jsonb not null default '[]'::jsonb,
  drill_json jsonb not null default '[]'::jsonb,
  cooldown_json jsonb not null default '[]'::jsonb,
  dryland_json jsonb not null default '[]'::jsonb,
  completed boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.chat_threads (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.uploaded_files (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  file_name text not null,
  storage_path text,
  public_url text,
  mime_type text not null,
  size_bytes integer not null default 0,
  kind text not null default 'other',
  summary text,
  extracted_entries_json jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  thread_id uuid references public.chat_threads(id) on delete set null,
  uploaded_file_id uuid references public.uploaded_files(id) on delete set null,
  role text not null,
  content text not null,
  suggestions text[] not null default '{}',
  actions_json jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.swim_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  uploaded_file_id uuid references public.uploaded_files(id) on delete set null,
  log_date date not null,
  yardage integer not null default 0,
  duration_minutes integer not null default 0,
  log_type text not null default 'practice',
  soreness_level integer,
  note text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.time_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  swim_log_id uuid references public.swim_logs(id) on delete set null,
  event_name text not null,
  course text not null default 'SCY',
  time_display text not null,
  time_seconds numeric(8,2) not null,
  recorded_at date not null,
  context text not null default 'practice',
  note text,
  source text not null default 'manual',
  confidence numeric(4,2),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.coach_notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  body text not null,
  category text not null default 'technique',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.profiles(id) on delete cascade,
  tier text not null default 'free',
  status text not null default 'free',
  stripe_customer_id text,
  stripe_subscription_id text,
  monthly_message_limit integer,
  current_period_end timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.usage_tracking (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  metric text not null,
  current_count integer not null default 0,
  period_start timestamptz not null default date_trunc('month', timezone('utc', now())),
  period_end timestamptz not null default (date_trunc('month', timezone('utc', now())) + interval '1 month'),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (user_id, metric, period_start)
);

create index if not exists swimmer_profiles_user_idx on public.swimmer_profiles(user_id);
create index if not exists swimmer_goals_user_idx on public.swimmer_goals(user_id);
create index if not exists swimmer_best_times_user_idx on public.swimmer_best_times(user_id, recorded_at desc);
create index if not exists weekly_plans_user_idx on public.weekly_plans(user_id, week_of desc);
create index if not exists workout_days_plan_idx on public.workout_days(weekly_plan_id, day_index);
create index if not exists chat_threads_user_idx on public.chat_threads(user_id, updated_at desc);
create index if not exists chat_messages_user_idx on public.chat_messages(user_id, created_at asc);
create index if not exists swim_logs_user_idx on public.swim_logs(user_id, log_date desc);
create index if not exists time_entries_user_idx on public.time_entries(user_id, recorded_at desc);
create index if not exists coach_notes_user_idx on public.coach_notes(user_id, created_at desc);
create index if not exists uploaded_files_user_idx on public.uploaded_files(user_id, created_at desc);
create index if not exists subscriptions_user_idx on public.subscriptions(user_id);
create index if not exists usage_tracking_user_idx on public.usage_tracking(user_id, metric, period_start desc);

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create trigger swimmer_profiles_set_updated_at
before update on public.swimmer_profiles
for each row execute function public.set_updated_at();

create trigger swimmer_goals_set_updated_at
before update on public.swimmer_goals
for each row execute function public.set_updated_at();

create trigger swimmer_best_times_set_updated_at
before update on public.swimmer_best_times
for each row execute function public.set_updated_at();

create trigger weekly_plans_set_updated_at
before update on public.weekly_plans
for each row execute function public.set_updated_at();

create trigger workout_days_set_updated_at
before update on public.workout_days
for each row execute function public.set_updated_at();

create trigger chat_threads_set_updated_at
before update on public.chat_threads
for each row execute function public.set_updated_at();

create trigger uploaded_files_set_updated_at
before update on public.uploaded_files
for each row execute function public.set_updated_at();

create trigger chat_messages_set_updated_at
before update on public.chat_messages
for each row execute function public.set_updated_at();

create trigger swim_logs_set_updated_at
before update on public.swim_logs
for each row execute function public.set_updated_at();

create trigger time_entries_set_updated_at
before update on public.time_entries
for each row execute function public.set_updated_at();

create trigger coach_notes_set_updated_at
before update on public.coach_notes
for each row execute function public.set_updated_at();

create trigger subscriptions_set_updated_at
before update on public.subscriptions
for each row execute function public.set_updated_at();

create trigger usage_tracking_set_updated_at
before update on public.usage_tracking
for each row execute function public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.swimmer_profiles enable row level security;
alter table public.swimmer_goals enable row level security;
alter table public.swimmer_best_times enable row level security;
alter table public.weekly_plans enable row level security;
alter table public.workout_days enable row level security;
alter table public.chat_threads enable row level security;
alter table public.chat_messages enable row level security;
alter table public.swim_logs enable row level security;
alter table public.time_entries enable row level security;
alter table public.coach_notes enable row level security;
alter table public.uploaded_files enable row level security;
alter table public.subscriptions enable row level security;
alter table public.usage_tracking enable row level security;

create policy if not exists "profiles_select_own" on public.profiles for select using (auth.uid() = id);
create policy if not exists "profiles_update_own" on public.profiles for update using (auth.uid() = id);
create policy if not exists "profiles_insert_own" on public.profiles for insert with check (auth.uid() = id);

create policy if not exists "swimmer_profiles_all_own" on public.swimmer_profiles for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy if not exists "swimmer_goals_all_own" on public.swimmer_goals for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy if not exists "swimmer_best_times_all_own" on public.swimmer_best_times for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy if not exists "weekly_plans_all_own" on public.weekly_plans for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy if not exists "workout_days_all_own" on public.workout_days for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy if not exists "chat_threads_all_own" on public.chat_threads for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy if not exists "chat_messages_all_own" on public.chat_messages for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy if not exists "swim_logs_all_own" on public.swim_logs for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy if not exists "time_entries_all_own" on public.time_entries for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy if not exists "coach_notes_all_own" on public.coach_notes for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy if not exists "uploaded_files_all_own" on public.uploaded_files for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy if not exists "subscriptions_all_own" on public.subscriptions for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy if not exists "usage_tracking_all_own" on public.usage_tracking for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create or replace function public.increment_usage_metric(p_user_id uuid, p_metric text, p_increment_by integer default 1)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  current_period_start timestamptz := date_trunc('month', timezone('utc', now()));
  current_period_end timestamptz := current_period_start + interval '1 month';
begin
  insert into public.usage_tracking (
    user_id,
    metric,
    current_count,
    period_start,
    period_end
  )
  values (
    p_user_id,
    p_metric,
    greatest(p_increment_by, 0),
    current_period_start,
    current_period_end
  )
  on conflict (user_id, metric, period_start)
  do update set
    current_count = public.usage_tracking.current_count + greatest(p_increment_by, 0),
    updated_at = timezone('utc', now());
end;
$$;

grant execute on function public.increment_usage_metric(uuid, text, integer) to authenticated;

do $$
begin
  insert into storage.buckets (id, name, public)
  values ('swim-uploads', 'swim-uploads', true)
  on conflict (id) do nothing;
exception
  when undefined_table then
    null;
end $$;

create policy if not exists "swim_uploads_select_own" on storage.objects
for select using (
  bucket_id = 'swim-uploads' and auth.uid()::text = (storage.foldername(name))[1]
);

create policy if not exists "swim_uploads_insert_own" on storage.objects
for insert with check (
  bucket_id = 'swim-uploads' and auth.uid()::text = (storage.foldername(name))[1]
);

create policy if not exists "swim_uploads_update_own" on storage.objects
for update using (
  bucket_id = 'swim-uploads' and auth.uid()::text = (storage.foldername(name))[1]
);

create policy if not exists "swim_uploads_delete_own" on storage.objects
for delete using (
  bucket_id = 'swim-uploads' and auth.uid()::text = (storage.foldername(name))[1]
);
