-- Seed CSE Year 3: subjects, units, topics (no UNION; safe for Supabase SQL Editor)
-- Run in order. Assumes branch with code 'CSE' exists.

-- 1) Subjects for CSE Year 3
INSERT INTO public.subjects (branch_id, year, name, code)
SELECT b.id, 3, v.name, v.code
FROM public.branches b
CROSS JOIN (VALUES
  ('Operating Systems', 'CSE-OS'),
  ('DBMS', 'CSE-DBMS'),
  ('Computer Networks', 'CSE-CN'),
  ('Software Engineering', 'CSE-SE')
) AS v(name, code)
WHERE b.code = 'CSE';

-- 2) Units for Operating Systems
INSERT INTO public.units (subject_id, number, name)
SELECT s.id, v.num, v.name
FROM public.subjects s
CROSS JOIN (VALUES
  (1, 'Introduction'),
  (2, 'Process Management'),
  (3, 'Memory Management'),
  (4, 'File Systems'),
  (5, 'Deadlocks')
) AS v(num, name)
WHERE s.code = 'CSE-OS';

-- 3) Units for DBMS
INSERT INTO public.units (subject_id, number, name)
SELECT s.id, v.num, v.name
FROM public.subjects s
CROSS JOIN (VALUES
  (1, 'ER Model'),
  (2, 'Relational Model'),
  (3, 'SQL'),
  (4, 'Normalization'),
  (5, 'Transactions')
) AS v(num, name)
WHERE s.code = 'CSE-DBMS';

-- 4) Units for Computer Networks
INSERT INTO public.units (subject_id, number, name)
SELECT s.id, v.num, v.name
FROM public.subjects s
CROSS JOIN (VALUES
  (1, 'OSI Model'),
  (2, 'Data Link Layer'),
  (3, 'Network Layer'),
  (4, 'Transport Layer'),
  (5, 'Application Layer')
) AS v(num, name)
WHERE s.code = 'CSE-CN';

-- 5) Units for Software Engineering
INSERT INTO public.units (subject_id, number, name)
SELECT s.id, v.num, v.name
FROM public.subjects s
CROSS JOIN (VALUES
  (1, 'SDLC'),
  (2, 'Requirements'),
  (3, 'Design'),
  (4, 'Testing'),
  (5, 'Maintenance')
) AS v(num, name)
WHERE s.code = 'CSE-SE';

-- 6) Topics for CSE-OS Unit 1
INSERT INTO public.topics (unit_id, name, is_important)
SELECT u.id, v.name, false
FROM public.units u
JOIN public.subjects s ON s.id = u.subject_id AND s.code = 'CSE-OS' AND u.number = 1
CROSS JOIN (VALUES ('OS Types'), ('System Calls'), ('Kernel')) AS v(name);

-- 7) Topics for CSE-OS Unit 2
INSERT INTO public.topics (unit_id, name, is_important)
SELECT u.id, v.name, false
FROM public.units u
JOIN public.subjects s ON s.id = u.subject_id AND s.code = 'CSE-OS' AND u.number = 2
CROSS JOIN (VALUES ('Process States'), ('PCB'), ('Context Switching')) AS v(name);

-- 8) Topics for CSE-OS Unit 3
INSERT INTO public.topics (unit_id, name, is_important)
SELECT u.id, v.name, v.imp
FROM public.units u
JOIN public.subjects s ON s.id = u.subject_id AND s.code = 'CSE-OS' AND u.number = 3
CROSS JOIN (VALUES ('Paging', false), ('Segmentation', false), ('Virtual Memory', false), ('Page Replacement Algorithms', true)) AS v(name, imp);

-- 9) Topics for CSE-DBMS Unit 3
INSERT INTO public.topics (unit_id, name, is_important)
SELECT u.id, v.name, v.imp
FROM public.units u
JOIN public.subjects s ON s.id = u.subject_id AND s.code = 'CSE-DBMS' AND u.number = 3
CROSS JOIN (VALUES ('DDL', false), ('DML', false), ('Joins', true), ('Subqueries', false), ('Aggregate Functions', false)) AS v(name, imp);

-- 10) Topics for CSE-CN Unit 4
INSERT INTO public.topics (unit_id, name, is_important)
SELECT u.id, v.name, false
FROM public.units u
JOIN public.subjects s ON s.id = u.subject_id AND s.code = 'CSE-CN' AND u.number = 4
CROSS JOIN (VALUES ('TCP vs UDP'), ('Flow Control'), ('Congestion Control')) AS v(name);
