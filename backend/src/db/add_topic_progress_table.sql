-- Migration: Add topic_progress table for tracking student progress
-- This table tracks which topics each student has completed

-- Create topic_progress table if it doesn't exist
CREATE TABLE IF NOT EXISTS topic_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  topic_id uuid not null,
  status text not null default 'not_started'
    check (status in ('not_started', 'in_progress', 'completed')),
  updated_at timestamptz not null default now(),
  unique (user_id, topic_id)
);

-- Add foreign key constraints if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'topic_progress_user_id_fkey'
  ) THEN
    ALTER TABLE topic_progress
    ADD CONSTRAINT topic_progress_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'topic_progress_topic_id_fkey'
  ) THEN
    ALTER TABLE topic_progress
    ADD CONSTRAINT topic_progress_topic_id_fkey
    FOREIGN KEY (topic_id) REFERENCES topics(id) ON DELETE CASCADE;
  END IF;
END
$$;

-- Enable RLS
ALTER TABLE topic_progress ENABLE ROW LEVEL SECURITY;

-- Create RLS policy if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'topic_progress'
    AND policyname = 'allow_all_topic_progress'
  ) THEN
    CREATE POLICY allow_all_topic_progress ON topic_progress
    FOR ALL USING (true) WITH CHECK (true);
  END IF;
END
$$;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_topic_progress_user_id
ON topic_progress(user_id);

CREATE INDEX IF NOT EXISTS idx_topic_progress_topic_id
ON topic_progress(topic_id);

CREATE INDEX IF NOT EXISTS idx_topic_progress_user_topic
ON topic_progress(user_id, topic_id);
