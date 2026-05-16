-- Run if topic_progress table does not exist yet.
create table if not exists topic_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  topic_id uuid not null references topics(id) on delete cascade,
  status text not null default 'not_started'
    check (status in ('not_started', 'in_progress', 'completed')),
  updated_at timestamptz not null default now(),
  unique (user_id, topic_id)
);
alter table topic_progress enable row level security;
create policy allow_all_topic_progress on topic_progress for all using (true) with check (true);
