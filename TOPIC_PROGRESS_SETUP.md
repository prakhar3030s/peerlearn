# Topic Progress Tracking System - Setup Guide

## Overview

This guide explains the complete topic progress tracking system that allows students to track their learning journey through the PeerLearn syllabus.

---

## Database Setup

### 1. Create the `topic_progress` Table

Run the migration file to create the table:

```bash
# Execute the migration SQL
psql -U postgres -d peerlearn -f backend/src/db/add_topic_progress_table.sql
```

**Or manually in Supabase Dashboard:**

1. Go to SQL Editor
2. Run the contents of `backend/src/db/add_topic_progress_table.sql`
3. Verify the table was created

### 2. Table Structure

```sql
CREATE TABLE topic_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  topic_id uuid NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'not_started'
    CHECK (status IN ('not_started', 'in_progress', 'completed')),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, topic_id)
);
```

**Indexes created:**
- `user_id` - Fast lookups by user
- `topic_id` - Fast lookups by topic
- `(user_id, topic_id)` - Fast upsert operations

---

## Backend Setup

### 1. Progress Service

File: `backend/src/services/progress.service.js`

**Key Functions:**

```javascript
// Get comprehensive progress for a student
import { getStudentProgress } from '../services/progress.service.js';
const progress = await getStudentProgress(userId);

// Mark topic as completed
import { markTopicCompleted } from '../services/progress.service.js';
await markTopicCompleted(userId, topicId);

// Get class leaderboard
import { getClassProgress } from '../services/progress.service.js';
const classProgress = await getClassProgress(branchId, year);
```

### 2. API Endpoints

File: `backend/src/routes/progress.routes.js`

**Endpoints:**

| Method | Route | Body/Params | Purpose |
|--------|-------|------------|---------|
| GET | `/api/progress/student/:user_id` | user_id | Get comprehensive progress with analytics |
| GET | `/api/progress` | ?user_id=... | Get simple topic progress map |
| GET | `/api/progress/class` | ?branch_id=...&year=... | Get class leaderboard |
| POST | `/api/progress/mark-started` | {user_id, topic_id} | Mark topic as in progress |
| POST | `/api/progress/mark-completed` | {user_id, topic_id} | Mark topic as completed |
| POST | `/api/progress/reset` | {user_id, topic_id} | Reset topic progress |
| PATCH | `/api/progress` | {user_id, topic_id, status} | Update topic status |

**Example Request:**

```bash
# Mark a topic as completed
curl -X POST http://localhost:5000/api/progress/mark-completed \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "student-uuid",
    "topic_id": "topic-uuid"
  }'
```

---

## Frontend Setup

### 1. Custom Hooks

File: `frontend/src/hooks/useProgress.js`

**Available Hooks:**

```javascript
// Read progress data
import { useProgress, useStudentProgress, useClassProgress } from '../hooks/useProgress.js';

// Update progress
import { useSetProgress, useMarkTopicStarted, useMarkTopicCompleted } from '../hooks/useProgress.js';

// Usage:
const { data: byTopic } = useProgress(userId);
const { data: progressData } = useStudentProgress(userId);
const { mutate: markCompleted } = useMarkTopicCompleted(userId);
```

### 2. Progress Page

File: `frontend/src/pages/Progress.jsx`

**Features:**
- Branch and year selection
- Overall progress circle
- Subject-level breakdown
- Unit-level tracking
- Quick status dropdown
- Streak counter

**Route:** `/progress`

---

## Complete Usage Flow

### For Students

1. **View Progress:**
   ```
   Navigate to /progress
   → Select Branch & Year
   → See overall completion %
   → View subject breakdowns
   ```

2. **Mark Topics:**
   ```
   Hover over topic dropdown
   → Select status (Not Started / In Progress / Completed)
   → See percentage update
   ```

3. **Check Stats:**
   ```
   View overall progress circle
   Check important topics completion
   Compare with classmates on leaderboard
   ```

### For Developers

1. **Get Progress Data:**
   ```javascript
   import { useStudentProgress } from '../hooks/useProgress.js';
   
   const { data: progress } = useStudentProgress(userId);
   console.log(progress.stats.completion_percentage); // 45%
   console.log(progress.stats.by_subject); // Subject breakdown
   ```

2. **Update Progress:**
   ```javascript
   import { useMarkTopicCompleted } from '../hooks/useProgress.js';
   
   const { mutate: markCompleted } = useMarkTopicCompleted(userId);
   markCompleted(topicId); // Automatically updates UI
   ```

3. **Fetch from API:**
   ```javascript
   // Using axios
   const response = await api.get(`/progress/student/${userId}`);
   const stats = response.data.data.stats;
   ```

---

## Data Returned by API

### `/api/progress/student/:user_id`

```json
{
  "user": {
    "id": "uuid",
    "name": "Student Name",
    "email": "student@example.edu",
    "branch_id": "uuid",
    "year": 3
  },
  "stats": {
    "total_topics": 244,
    "completed": 45,
    "in_progress": 30,
    "not_started": 169,
    "completion_percentage": 18,
    "important_topics": {
      "total": 15,
      "completed": 8,
      "completion_percentage": 53
    },
    "by_subject": {
      "subject-uuid": {
        "id": "uuid",
        "name": "Computer Networks",
        "code": "CS301",
        "total": 25,
        "completed": 10,
        "completion_percentage": 40
      }
    },
    "by_unit": {
      "unit-uuid": {
        "id": "uuid",
        "name": "OSI Model",
        "number": 1,
        "total": 5,
        "completed": 2,
        "completion_percentage": 40
      }
    }
  },
  "progress": {
    "topic-uuid": {
      "status": "completed",
      "updated_at": "2024-01-15T10:30:00Z"
    }
  }
}
```

---

## Testing the System

### 1. Test Database Connection

```bash
# From backend root
npm run dev

# Check if progress routes load (should see no errors)
```

### 2. Test API Endpoints

```bash
# Mark a topic as completed
curl -X POST http://localhost:5000/api/progress/mark-completed \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "aarav-mehta-id",
    "topic_id": "avl-trees-topic-id"
  }'

# Get student progress
curl http://localhost:5000/api/progress/student/aarav-mehta-id

# Get class leaderboard
curl "http://localhost:5000/api/progress/class?branch_id=cse-id&year=3"
```

### 3. Test Frontend

```bash
# Open in browser
http://localhost:5173/progress

# Select CSE, Year 3
# Click dropdown on a topic
# Select "Completed"
# Watch percentage update
```

---

## Performance Optimization

### Indexes

The migration creates three indexes:

```sql
-- Lookup by user
CREATE INDEX idx_topic_progress_user_id ON topic_progress(user_id);

-- Lookup by topic
CREATE INDEX idx_topic_progress_topic_id ON topic_progress(topic_id);

-- Upsert operations (most common)
CREATE INDEX idx_topic_progress_user_topic ON topic_progress(user_id, topic_id);
```

### Query Performance

- **Get user progress:** O(n) where n = topics for user's program
- **Update topic status:** O(1) with indexes
- **Calculate stats:** O(n) single pass through topics

---

## Troubleshooting

### Issue: "Table does not exist"

**Solution:**
```bash
# Run the migration
psql -U postgres -d peerlearn -f backend/src/db/add_topic_progress_table.sql
```

### Issue: "Foreign key constraint fails"

**Solution:**
```sql
-- Check if constraints exist
SELECT constraint_name 
FROM information_schema.table_constraints 
WHERE table_name = 'topic_progress';
```

### Issue: "RLS policy prevents access"

**Solution:**
```sql
-- Verify RLS policy
SELECT * FROM pg_policies WHERE tablename = 'topic_progress';

-- If missing, create it
CREATE POLICY allow_all_topic_progress ON topic_progress
FOR ALL USING (true) WITH CHECK (true);
```

### Issue: "No topics showing in Progress page"

**Solution:**
1. Ensure branch and year are selected
2. Verify topics exist for that branch/year
3. Check user has correct branch_id and year in database

---

## Integration Points

### When Viewing a Video

```javascript
// In VideoPage.jsx
import { useMarkTopicCompleted } from '../hooks/useProgress.js';

const { mutate: markCompleted } = useMarkTopicCompleted(currentUser?.id);

const handleVideoEnd = () => {
  markCompleted(topicId); // Auto-marks as completed
};
```

### When Browsing Topics

```javascript
// In Browse.jsx or Topic components
import { useProgress } from '../hooks/useProgress.js';

const { data: progressMap } = useProgress(userId);
const topicStatus = progressMap[topicId]?.status || 'not_started';
```

### In Admin Dashboard

```javascript
// Show class progress
import { useClassProgress } from '../hooks/useProgress.js';

const { data: classProgress } = useClassProgress(branchId, year);
// Shows leaderboard of students by completion %
```

---

## Future Enhancements

1. **Streak Tracking** - Track consecutive days of learning
2. **Notifications** - Alert when important topics incomplete
3. **Recommendations** - Suggest next topics based on progress
4. **Analytics** - Dashboard for teachers to monitor class progress
5. **Time Tracking** - Track time spent on each topic
6. **Achievement Badges** - Badges for milestones

---

## Summary

✅ **Database:** `topic_progress` table with proper constraints
✅ **Backend:** Progress service + API endpoints
✅ **Frontend:** React hooks + Progress page
✅ **UI:** Progress tracking with dropdowns
✅ **Performance:** Indexed queries for fast lookups
✅ **Ready to use!**

Start tracking student progress now! 🚀
