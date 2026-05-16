-- PeerLearn Supabase schema

-- Enable required extensions
create extension if not exists "pgcrypto";

-- BRANCHES
create table if not exists branches (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  code text not null unique,
  created_at timestamptz not null default now()
);

-- SUBJECTS
create table if not exists subjects (
  id uuid primary key default gen_random_uuid(),
  branch_id uuid not null references branches(id) on delete cascade,
  year int not null check (year between 1 and 4),
  name text not null,
  code text not null,
  created_at timestamptz not null default now()
);

-- UNITS
create table if not exists units (
  id uuid primary key default gen_random_uuid(),
  subject_id uuid not null references subjects(id) on delete cascade,
  number int not null,
  name text not null
);

-- TOPICS
create table if not exists topics (
  id uuid primary key default gen_random_uuid(),
  unit_id uuid not null references units(id) on delete cascade,
  name text not null,
  subtopic text,
  is_important boolean not null default false
);

-- USERS
create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null unique,
  role text not null default 'student' check (role in ('student','moderator','admin')),
  year int,
  branch_id uuid references branches(id),
  reputation_score int not null default 0,
  created_at timestamptz not null default now()
);

-- SUBMISSIONS
create table if not exists submissions (
  id uuid primary key default gen_random_uuid(),
  contributor_id uuid not null references users(id),
  youtube_url text not null,
  drive_url text,
  topic_id uuid not null references topics(id),
  description text not null,
  language text not null default 'English',
  status text not null default 'pending'
    check (status in ('pending','under_review','approved','rejected','flagged','removed')),
  rejection_reason text,
  reviewed_by uuid references users(id),
  reviewed_at timestamptz,
  youtube_title text,
  youtube_thumbnail text,
  youtube_duration text,
  view_count int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- RATINGS
create table if not exists ratings (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references users(id),
  submission_id uuid not null references submissions(id) on delete cascade,
  clarity_score int not null check (clarity_score between 1 and 5),
  usefulness_score int not null check (usefulness_score between 1 and 5),
  created_at timestamptz not null default now(),
  unique (student_id, submission_id)
);

-- FLAGS
create table if not exists flags (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references users(id),
  submission_id uuid not null references submissions(id) on delete cascade,
  reason text not null,
  created_at timestamptz not null default now(),
  unique (student_id, submission_id)
);

-- NOTIFICATIONS
create table if not exists notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id),
  type text not null,
  title text not null,
  message text,
  read boolean not null default false,
  created_at timestamptz not null default now()
);

-- TOPIC PROGRESS (per-student syllabus completion)
create table if not exists topic_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  topic_id uuid not null references topics(id) on delete cascade,
  status text not null default 'not_started'
    check (status in ('not_started', 'in_progress', 'completed')),
  updated_at timestamptz not null default now(),
  unique (user_id, topic_id)
);

-- Row Level Security
alter table branches enable row level security;
alter table subjects enable row level security;
alter table units enable row level security;
alter table topics enable row level security;
alter table users enable row level security;
alter table submissions enable row level security;
alter table ratings enable row level security;
alter table flags enable row level security;
alter table notifications enable row level security;
alter table topic_progress enable row level security;

-- For now, create permissive policies since auth is not wired yet.
do $$
begin
  if not exists (select 1 from pg_policies where tablename = 'branches' and policyname = 'allow_all_branches') then
    create policy allow_all_branches on branches for all using (true) with check (true);
  end if;

  if not exists (select 1 from pg_policies where tablename = 'subjects' and policyname = 'allow_all_subjects') then
    create policy allow_all_subjects on subjects for all using (true) with check (true);
  end if;

  if not exists (select 1 from pg_policies where tablename = 'units' and policyname = 'allow_all_units') then
    create policy allow_all_units on units for all using (true) with check (true);
  end if;

  if not exists (select 1 from pg_policies where tablename = 'topics' and policyname = 'allow_all_topics') then
    create policy allow_all_topics on topics for all using (true) with check (true);
  end if;

  if not exists (select 1 from pg_policies where tablename = 'users' and policyname = 'allow_all_users') then
    create policy allow_all_users on users for all using (true) with check (true);
  end if;

  if not exists (select 1 from pg_policies where tablename = 'submissions' and policyname = 'allow_all_submissions') then
    create policy allow_all_submissions on submissions for all using (true) with check (true);
  end if;

  if not exists (select 1 from pg_policies where tablename = 'ratings' and policyname = 'allow_all_ratings') then
    create policy allow_all_ratings on ratings for all using (true) with check (true);
  end if;

  if not exists (select 1 from pg_policies where tablename = 'flags' and policyname = 'allow_all_flags') then
    create policy allow_all_flags on flags for all using (true) with check (true);
  end if;

  if not exists (select 1 from pg_policies where tablename = 'notifications' and policyname = 'allow_all_notifications') then
    create policy allow_all_notifications on notifications for all using (true) with check (true);
  end if;
  if not exists (select 1 from pg_policies where tablename = 'topic_progress' and policyname = 'allow_all_topic_progress') then
    create policy allow_all_topic_progress on topic_progress for all using (true) with check (true);
  end if;
end $$;

-- Trigger to keep submissions.updated_at in sync
create or replace function set_submissions_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_set_submissions_updated_at on submissions;

create trigger trg_set_submissions_updated_at
before update on submissions
for each row
execute function set_submissions_updated_at();

