# Windows Setup - Fix Foreign Key Error

## Problem

You're getting a foreign key error because:
1. The user ID in your browser is from before the seed ran
2. The database was reset by the seed script
3. Old user IDs no longer exist

## Solution - 3 Steps

### Step 1: Clear Browser Storage

**In your browser (Chrome/Firefox/Edge):**

1. Press `F12` to open Developer Tools
2. Go to **Application** tab
3. Click **Local Storage**
4. Find `http://localhost:5173`
5. Click it
6. Find `peerlearn-user` entry
7. Right-click and **Delete**
8. Also delete `peerlearn-dev-role` if it exists
9. Close Developer Tools

**OR use browser console:**

```javascript
localStorage.removeItem('peerlearn-user');
localStorage.removeItem('peerlearn-dev-role');
console.log('Cleared!');
```

### Step 2: Refresh Page

Press `Ctrl+Shift+Delete` (Windows) to do a hard refresh:
- This clears both cache and localStorage
- Page will reload completely

OR:
1. Close all browser tabs with PeerLearn
2. Close browser completely
3. Reopen browser
4. Go to `http://localhost:5173`

### Step 3: Login with Demo Account

1. Click **"Student Account"** button (pre-filled)
2. Email: `aarav.mehta@peerlearn.edu`
3. Password: `student123456`
4. Click **"Log in"**
5. Go to **"Progress"** page
6. Select **"CSE"** branch
7. Select **"1"** year
8. Click dropdown on any topic
9. Select **"Completed"**
10. Watch percentage update! ✅

---

## Why This Happened

```
Before Seed:
  User ID: ba46d7e4-f9dd-4842-a582-4d4c5b925865 (stored in localStorage)
         ↓
  Database: This ID doesn't exist yet
         ↓
  Seed runs:
  - Deletes all old data
  - Creates new users with NEW IDs
  - Old ID no longer in database!
         ↓
  Try to mark topic:
  ❌ Error: user_id not in users table
```

---

## Complete Windows Workflow

### Terminal 1: Start Backend
```bash
cd backend
npm run dev
```

### Terminal 2: Run Seed (Do this ONCE)
```bash
npm run seed
```

You should see:
```
✓ Set password for aarav.mehta@peerlearn.edu
✓ Set password for moderator@peerlearn.edu
✓ Set password for admin@peerlearn.edu
✅ PeerLearn seed completed successfully.
```

### Browser: Login Fresh

1. **Clear localStorage** (see Step 1 above)
2. **Hard refresh page** (`Ctrl+Shift+Del`)
3. **Click "Student Account"** button
4. **Click "Log in"**
5. **Done!**

---

## Verify It's Working

### In Browser Console

```javascript
// Check if user is logged in
const user = JSON.parse(localStorage.getItem('peerlearn-user'));
console.log('User:', user);
console.log('User ID:', user?.id);
```

You should see the new user ID (NOT the old one).

### In Progress Page

1. Go to `/progress`
2. Select **CSE, Year 1**
3. Click any topic dropdown
4. Select **Completed**
5. Percentage should update ✅

---

## If It Still Doesn't Work

### Check 1: Backend Running?
```
Terminal should show:
PeerLearn backend listening on port 5000
```

If not, run: `npm run dev` in backend folder

### Check 2: Database Seeded?
Run this in terminal:
```bash
npm run seed
```

Should complete with `✅ PeerLearn seed completed successfully.`

### Check 3: Browser Cache?
Do this:
1. Press `F12` (Developer Tools)
2. Right-click reload button
3. Select **"Empty cache and hard refresh"**

### Check 4: Correct Login?
After clearing localStorage:
1. Go to `/login`
2. Click **"Student Account"** button
3. Should auto-fill with: `aarav.mehta@peerlearn.edu`
4. Click **"Log in"**

---

## Windows-Specific Notes

### psql Command Not Found

On Windows, `psql` might not be in PATH. Instead, use:

**Option 1: Use Supabase Dashboard (Recommended)**
1. Go to Supabase dashboard
2. SQL Editor
3. Paste SQL from `backend/src/db/add_topic_progress_table.sql`
4. Run

**Option 2: Add PostgreSQL to PATH**
1. Find PostgreSQL installation (usually `C:\Program Files\PostgreSQL\15\bin`)
2. Add to PATH
3. Restart terminal

**Option 3: Use NPM Seed (Easiest)**
```bash
npm run seed
```
This handles all database operations!

---

## Quick Commands for Windows

```bash
# Start backend (Terminal 1)
cd backend
npm run dev

# Seed database (Terminal 2)
npm run seed

# Then in browser:
# 1. Clear localStorage (F12 → Application → Local Storage)
# 2. Hard refresh (Ctrl+Shift+Del)
# 3. Login with demo account
# 4. Go to Progress page
# 5. Mark topics as complete!
```

---

## Demo Credentials (All Valid After Seed)

| Email | Password |
|-------|----------|
| **aarav.mehta@peerlearn.edu** | student123456 |
| isha.verma@peerlearn.edu | student123456 |
| rohan.sharma@peerlearn.edu | student123456 |
| neha.gupta@peerlearn.edu | student123456 |
| moderator@peerlearn.edu | 123456789 |
| admin@peerlearn.edu | 789456123 |

---

## One More Time - The Fix

1. ✅ Clear browser localStorage
2. ✅ Hard refresh browser
3. ✅ Login with demo account
4. ✅ Go to Progress
5. ✅ Mark topics

**That's it! You're done!** 🚀
