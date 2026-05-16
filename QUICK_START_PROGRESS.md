# Topic Progress Tracking - Quick Start Guide

## 🚀 5-Minute Setup

### Step 1: Create Database Table (1 min)

**Option A: Using Supabase Dashboard**
1. Go to **SQL Editor** in Supabase
2. Copy-paste contents from `backend/src/db/add_topic_progress_table.sql`
3. Click **Run** ✅

**Option B: Using Terminal**
```bash
psql -U postgres -d peerlearn -f backend/src/db/add_topic_progress_table.sql
```

### Step 2: Restart Backend (1 min)

```bash
cd backend
npm run dev
```

Should see no errors. Progress routes are already configured.

### Step 3: Test in Browser (3 min)

1. **Open app:** `http://localhost:5173`
2. **Navigate to:** `/progress`
3. **Select:** CSE, Year 3
4. **Click dropdown** next to any topic
5. **Select:** "Completed"
6. **Watch:** Percentage updates! ✅

---

## 📊 What You Get

### Progress Page Features

✅ Overall completion circle (0-100%)  
✅ Subject-level breakdown  
✅ Unit-level tracking  
✅ Topic status dropdown  
✅ Quick jump button  
✅ Streak counter  

### API Endpoints Ready

```bash
# Mark topic as completed
POST /api/progress/mark-completed
Body: { user_id, topic_id }

# Get student progress
GET /api/progress/student/:user_id

# Get class leaderboard
GET /api/progress/class?branch_id=...&year=...
```

---

## 🔧 Using in Your Code

### Get Progress Data

```javascript
import { useStudentProgress } from '../hooks/useProgress.js';

const { data: progress } = useStudentProgress(userId);

// Access completion percentage
console.log(progress.stats.completion_percentage); // e.g., 45%

// Access by subject
progress.stats.by_subject.forEach(subject => {
  console.log(`${subject.name}: ${subject.completion_percentage}%`);
});
```

### Mark Topic Complete

```javascript
import { useMarkTopicCompleted } from '../hooks/useProgress.js';

const { mutate: markCompleted } = useMarkTopicCompleted(userId);

// In event handler
markCompleted(topicId);
```

### Quick Example: Video Page Integration

```javascript
// In VideoPage.jsx
import { useMarkTopicCompleted } from '../hooks/useProgress.js';

function VideoPage() {
  const { user } = useAuth();
  const { mutate: markCompleted } = useMarkTopicCompleted(user?.id);
  
  const handleVideoComplete = () => {
    // Auto-mark topic as completed when video finishes
    markCompleted(topicId);
    toast.success('Topic marked as completed!');
  };
  
  return (
    <>
      <VideoPlayer onEnded={handleVideoComplete} />
    </>
  );
}
```

---

## 📈 Available Hooks

```javascript
// Read Progress
useProgress(userId)              // Simple topic map
useStudentProgress(userId)       // Detailed with analytics
useClassProgress(branchId, year) // All students leaderboard

// Update Progress
useSetProgress(userId)           // Set arbitrary status
useMarkTopicStarted(userId)      // Mark as in_progress
useMarkTopicCompleted(userId)    // Mark as completed
```

---

## 🧪 Quick Tests

### Test 1: Mark Topic Complete

```bash
curl -X POST http://localhost:5000/api/progress/mark-completed \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "STUDENT_UUID",
    "topic_id": "TOPIC_UUID"
  }'
```

### Test 2: Get Progress

```bash
curl http://localhost:5000/api/progress/student/STUDENT_UUID
```

### Test 3: Check Database

```sql
SELECT * FROM topic_progress LIMIT 10;
```

---

## 🎯 Status Codes

Each topic can have 3 states:

| Status | Meaning |
|--------|---------|
| `not_started` | Gray - Haven't started |
| `in_progress` | Yellow - Currently learning |
| `completed` | Green - Finished |

---

## ✅ Checklist

- [ ] Ran migration SQL
- [ ] Backend is running (npm run dev)
- [ ] Progress page loads at `/progress`
- [ ] Can select branch and year
- [ ] Dropdown on topics works
- [ ] Percentage updates when marking topics
- [ ] No console errors

---

## 📚 Full Documentation

For detailed setup and troubleshooting, see: `TOPIC_PROGRESS_SETUP.md`

---

## 🆘 Troubleshooting

**Issue:** "Table does not exist"
```bash
# Run migration
psql -U postgres -d peerlearn -f backend/src/db/add_topic_progress_table.sql
```

**Issue:** "Progress page is blank"
- Make sure you selected a branch and year
- Verify topics exist for that branch/year in database

**Issue:** "Dropdown not updating"
- Check browser console for errors
- Verify user is logged in
- Check backend is running

---

## 🎓 You're All Set!

Your topic tracking system is now live. Students can track their learning progress! 🚀

Next Steps:
1. Integrate with Video Page to auto-mark completion
2. Add streak tracking
3. Add notifications for pending topics
4. Create teacher dashboard to monitor class progress
