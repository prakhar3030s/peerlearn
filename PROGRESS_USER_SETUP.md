# Fixing "User Not Found" Error in Progress Tracking

## Problem

When trying to mark a topic as complete, you get:
```
Key (user_id)=(...) is not present in table "users".
violates foreign key constraint "topic_progress_user_id_fkey"
```

## Cause

The user ID you're trying to use doesn't exist in the `users` table. This happens when:
- You're not logged in with a valid user
- The user ID was never created in the database
- You manually created progress records with invalid UUIDs

---

## Solution

### Option 1: Run the Seed Script (Recommended)

This creates all demo users and initial data:

```bash
npm run seed
```

This creates these valid users:

| Email | Password | Role | Year | Branch |
|-------|----------|------|------|--------|
| aarav.mehta@peerlearn.edu | student123456 | Student | 1 | CSE |
| isha.verma@peerlearn.edu | student123456 | Student | 2 | CSE |
| rohan.sharma@peerlearn.edu | student123456 | Student | 3 | CSE |
| neha.gupta@peerlearn.edu | student123456 | Student | 4 | CSE |
| aditya.rao@peerlearn.edu | student123456 | Student | 2 | ECE |
| kriti.nair@peerlearn.edu | student123456 | Student | 3 | ECE |
| vikram.singh@peerlearn.edu | student123456 | Student | 1 | ECE |
| moderator@peerlearn.edu | 123456789 | Moderator | - | - |
| admin@peerlearn.edu | 789456123 | Admin | - | - |

### Option 2: Register a New User

1. Go to `/login`
2. Click "Register"
3. Fill in the form
4. Click "Create account"
5. Now you have a valid user!

### Option 3: Use Demo Account

1. Go to `/login`
2. Click a demo account button (pre-filled)
3. Click "Log in"
4. Now you have a valid user!

---

## Complete Setup Steps

### Step 1: Ensure Backend is Running

```bash
cd backend
npm run dev
```

### Step 2: Run Seed Script

```bash
npm run seed
```

**Expected output:**
```
🌱 Seeding users...
🌱 Seeding submissions...
✅ Successfully inserted 244 videos
🌱 Seeding ratings for approved submissions...
```

### Step 3: Login with Demo Account

1. Open `http://localhost:5173/login`
2. Click **"Student Account"** button
   - Email: `aarav.mehta@peerlearn.edu`
   - Password: `student123456`
3. Click "Log in"
4. You should see "Browse" page

### Step 4: Navigate to Progress

1. Click **"Progress"** in navbar
2. Select **"CSE"** branch
3. Select **"Year 1"**
4. You should see topics from Year 1, CSE
5. Click dropdown on any topic
6. Select **"Completed"**
7. Watch percentage update! ✅

---

## Verify Users in Database

### Check if Users Exist

```bash
# Using psql
psql -U postgres -d peerlearn -c "SELECT id, name, email, role FROM users LIMIT 5;"
```

**Expected output:**
```
                  id                  |     name      |           email            |  role
--------------------------------------+---------------+----------------------------+---------
 xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx | Aarav Mehta   | aarav.mehta@peerlearn.edu | student
 xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx | Isha Verma    | isha.verma@peerlearn.edu  | student
```

### Check Topic Progress

```bash
# See if any progress exists
psql -U postgres -d peerlearn -c "SELECT * FROM topic_progress LIMIT 5;"
```

---

## Test Progress API

### Test 1: Get User ID

After logging in, open browser DevTools (F12):

```javascript
// In console
const user = JSON.parse(localStorage.getItem('peerlearn-user'));
console.log('User ID:', user?.id);
```

Copy the user ID.

### Test 2: Mark Topic Complete

Replace `USER_ID` and `TOPIC_ID` with real IDs:

```bash
curl -X POST http://localhost:5000/api/progress/mark-completed \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "USER_ID_HERE",
    "topic_id": "TOPIC_ID_HERE"
  }'
```

### Test 3: Get Progress

```bash
curl http://localhost:5000/api/progress/student/USER_ID_HERE
```

---

## Get Real Topic ID

From browser console after logging in:

```javascript
// Get topics
fetch('/api/browse')
  .then(r => r.json())
  .then(d => console.log(d.data[0])); // First topic with ID
```

Or check database:

```bash
psql -U postgres -d peerlearn -c "SELECT id, name FROM topics LIMIT 1;"
```

---

## Complete Flow to Fix

1. ✅ Ensure `topic_progress` table exists
   ```bash
   psql -U postgres -d peerlearn -f backend/src/db/add_topic_progress_table.sql
   ```

2. ✅ Restart backend
   ```bash
   cd backend && npm run dev
   ```

3. ✅ Seed database
   ```bash
   npm run seed
   ```

4. ✅ Open app and login
   ```
   http://localhost:5173/login
   ```

5. ✅ Use demo account
   ```
   Student: aarav.mehta@peerlearn.edu / student123456
   ```

6. ✅ Go to Progress page
   ```
   /progress → Select CSE, Year 1 → Mark topics
   ```

---

## Why This Happens

```
Login → User created with ID → Stored in localStorage
                              ↓
                         Mark topic complete
                              ↓
                         Check if user ID exists in DB
                              ↓
                         ❌ USER NOT FOUND in users table
                              ↓
                         ❌ Foreign key constraint error
```

**Solution:** Make sure user exists in `users` table before using their ID.

---

## Quick Checklist

- [ ] Backend running (`npm run dev`)
- [ ] Migration SQL ran
- [ ] Seed script ran (`npm run seed`)
- [ ] Logged in with demo account
- [ ] Can see topics in Progress page
- [ ] Dropdown works
- [ ] Percentage updates

---

## Still Having Issues?

### Check 1: User Exists?

```bash
psql -U postgres -d peerlearn \
  -c "SELECT * FROM users WHERE email='aarav.mehta@peerlearn.edu';"
```

If empty, run seed: `npm run seed`

### Check 2: Topic Exists?

```bash
psql -U postgres -d peerlearn \
  -c "SELECT COUNT(*) FROM topics;"
```

If 0, run seed: `npm run seed`

### Check 3: Constraint Created?

```bash
psql -U postgres -d peerlearn \
  -c "SELECT * FROM information_schema.table_constraints WHERE table_name='topic_progress';"
```

### Check 4: Browser Storage?

```javascript
// In console
localStorage.getItem('peerlearn-user') // Should have user object with ID
```

If null, not logged in. Login first!

---

## Commands to Run Right Now

```bash
# 1. Make sure backend is running
cd backend
npm run dev

# 2. In another terminal, seed database
cd backend
npm run seed

# 3. Open browser
http://localhost:5173/login

# 4. Click "Student Account" button
# 5. Click "Log in"
# 6. Go to "Progress"
# 7. Select CSE, Year 1
# 8. Click dropdown on topic
# 9. Select "Completed"
# 10. Watch percentage update!
```

---

That's it! You should now have a working progress tracking system! 🚀
