-- Run this if submissions table already exists without view_count (e.g. before schema was updated).
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS view_count int NOT NULL DEFAULT 0;
