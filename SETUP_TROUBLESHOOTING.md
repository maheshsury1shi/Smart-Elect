# 🔧 Setup Troubleshooting Guide

Solutions for common setup issues.

---

## 🔴 Backend Issues

### ❌ "Cannot find module" Error
```
Error: Cannot find module 'express'
```

**Solution:**
```bash
cd backend
rm -rf node_modules package-lock.json
npm install
```

---

### ❌ MongoDB Connection Error
```
MongooseError: connect ECONNREFUSED 127.0.0.1:27017
```

**Solution:**
```bash
# Option 1: Start local MongoDB
mongod

# Option 2: Use MongoDB Atlas (cloud)
# 1. Sign up: https://www.mongodb.com/cloud/atlas
# 2. Create cluster
# 3. Copy connection string
# 4. Edit backend/.env with your URI:
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/election_voting
```

---

### ❌ Port Already in Use
```
Error: listen EADDRINUSE: address already in use :::5000
```

**Solution:**
```bash
# Option 1: Change port in backend/.env
PORT=5001

# Option 2: Kill process using port 5000
# Windows:
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Mac/Linux:
lsof -i :5000
kill -9 <PID>
```

---

### ❌ .env File Not Found
```
Error: ENOENT: no such file or directory, open '.env'
```

**Solution:**
```bash
cd backend
cp .env.example .env
# Edit .env with your configuration
```

---

### ❌ "npm run seed" Fails

**Solution:**
```bash
# Make sure backend dependencies are installed
npm install

# Check MongoDB is running (if using local)
mongod

# Run seed command with verbose output
npm run seed

# If seed fails due to duplicates, reset and reseed:
npm run reset-seed

# If still fails, manually set these env vars:
export MONGODB_URI=mongodb://localhost:27017/election_voting
export JWT_SECRET=mysecretkey123456789
npm run seed
```

**If Admin User Not Created:**
```bash
# Run reset and seed to recreate admin:
npm run reset-seed

# This creates:
# - Admin user: admin@voting.com / Admin@123456
# - 3 sample candidates
```

---

### ❌ Express Server Won't Start

**Solution:**
```bash
# Check Node version (should be v16+)
node -v

# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install

# Try starting with explicit port
PORT=5000 npm run dev
```

---

## 🔴 Frontend Issues

### ❌ "npm install" Takes Too Long

**Solution:**
```bash
# Clear npm cache
npm cache clean --force

# Try install again with specific registry
npm install --registry https://registry.npmjs.org/

# Use npm ci for faster install (if package-lock exists)
npm ci
```

---

### ❌ Port 5173 Already in Use
```
Error: listen EADDRINUSE: address already in use :::5173
```

**Solution:**
```bash
# Vite will auto-increment port, or:
# Kill process using port 5173
# Windows:
netstat -ano | findstr :5173
taskkill /PID <PID> /F

# Mac/Linux:
lsof -i :5173
kill -9 <PID>
```

---

### ❌ "Cannot GET /" Error in Browser

**Solution:**
```bash
# Make sure frontend dev server is running
cd frontend
npm run dev

# Should show: Local: http://localhost:5173

# Check for build errors in terminal output
```

---

### ❌ Face Models Not Loading
```
Console Error: 404 GET /models/...
```

**Solution:**
1. Models are **pre-included** in `frontend/public/models/`
2. Should contain 18 files: `*_manifest.json` and `*_shard1/shard2` files
3. Check files exist: `ls frontend/public/models/`
4. If missing, they are available but models are pre-downloaded
5. Verify path in frontend loading code

**All Models Pre-Included:**
- `tiny_face_detector_model*`
- `face_landmark_68_model*`
- `face_recognition_model*`
- `age_gender_model*` (optional)
- Plus 3 more (optional)

---

### ❌ Camera Permission Denied

**Solution:**
```
Browser Console: NotAllowedError: Permission denied
```

1. **Chrome/Edge:** Click camera icon in address bar → Allow
2. **Firefox:** Click camera icon → Allow
3. **Safari:** Settings → Websites → Camera → Allow
4. Try incognito/private mode (clears cached denials)
5. Restart browser if still denied

---

### ❌ "Cannot connect to server"

**Solution:**
```
Error: Failed to fetch http://localhost:5000/api/...
```

1. Check backend is running: `npm run dev` in backend folder
2. Verify backend on `http://localhost:5000` in browser
3. Check backend URL in `frontend/src/utils/api.ts`
4. Ensure CORS is enabled (should be in Express code)
5. Check both servers are running (backend on 5000, frontend on 5173)

---

### ❌ Face Verification Fails During Voting
```
Error: Face did not match - Face distance too high
```

**Solution:**
1. **Lighting:** Ensure good lighting on face
2. **Distance:** Position face 30-60cm from camera
3. **Clarity:** Face must be clearly visible (no excessive blur)
4. **Expression:** Neutral expression works best
5. **Accessories:** Remove sunglasses/hats if possible
6. Try again with different angle/lighting

**If Consistently Fails:**
```bash
# Check face descriptor was saved during registration
# Go to Admin Dashboard → Voters → Check voter has face data

# If face data missing:
# Register again and ensure face capture step completes
```

---

### ❌ Aadhaar Hash Mismatch Error
```
Error: Aadhaar hash does not match registered Aadhaar
```

**Solution:**
1. Ensure Aadhaar entered exactly as registered (case-sensitive)
2. Aadhaar must be exactly 12 digits (no spaces/dashes)
3. System uses SHA-256 hashing - must match exactly

**To Fix Hash Consistency:**
```bash
cd backend
npm run fix-aadhaar

# This script ensures all Aadhaar hashes are consistent
```

---

### ❌ "Cannot vote twice" - But User Hasn't Voted

**Solution:**
```
Error: This voter has already voted
```

1. Check Admin Dashboard → Voters → Voting Status
2. Look for voter in the list, check "hasVoted" status
3. If marked as voted but shouldn't be:
   - Delete voter from Admin Dashboard
   - Register again with different email/Aadhaar

**To Reset All Votes:**
```bash
cd backend
npm run reset-seed

# WARNING: This deletes ALL DATA and recreates admin + candidates
# Use only for testing!
```

---

### ❌ Voter Profile Page Shows No Data
```
http://localhost:5173/voter/profile - Shows empty
```

**Solution:**
1. Ensure you're logged in as voter (not admin)
2. Go to `/voter/login` - enter voter credentials
3. Then go to `/voter/profile`
4. If still empty, hard refresh: `Ctrl+Shift+R`
5. Clear browser localStorage: `F12 → Application → Clear All`

---

### ❌ Admin Dashboard Doesn't Load
```
http://localhost:5173/admin/dashboard - Shows blank
```

**Solution:**
1. Hard refresh: `Ctrl+Shift+R`
2. Clear localStorage: `F12 → Application → Clear All`
3. Login again: `/admin/login` with `admin@voting.com / Admin@123456`
4. Check browser console for errors: `F12 → Console`
5. Verify backend is running: Check terminal for `npm run dev`

---

### ❌ Can't Distinguish Between Voter & Admin Login

**Solution:**
- **Voter Login:** `/voter/login` - For registered voters
- **Admin Login:** `/admin/login` - For election admin
- **Home Page:** `/` - Landing page

**Roles:**
- **Voter:** Can register, vote, view results
- **Admin:** Full election management, candidate/voter management

---

## 🔴 General Issues

### ❌ "npm: command not found"

**Solution:**
1. Install Node.js from https://nodejs.org/
2. Restart terminal/console
3. Verify: `npm -v` should show version number

---

### ❌ "git: command not found"

**Solution:**
1. Install Git from https://git-scm.com/
2. Restart terminal/console
3. Verify: `git --version` should show version number

---

### ❌ Windows PowerShell Execution Policy Error
```
PowerShell: File cannot be loaded because running scripts is disabled
```

**Solution:**
```powershell
# Run PowerShell as Administrator, then:
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

---

### ❌ "Command not found: bash" (Windows)

**Solution:**
1. Use PowerShell instead of Command Prompt
2. Or install Git Bash from https://git-scm.com/
3. Or use Windows Subsystem for Linux (WSL)

---

## 🟢 Verification Tests

After setup, verify everything works:

### Test Backend API Endpoints
```bash
# Test candidates endpoint
curl http://localhost:5000/api/candidates

# Should return JSON array of 3 candidates created by seed script

# Test results endpoint
curl http://localhost:5000/api/results/status

# Should return { declared: false } before admin declares results
```

### Test Frontend All Pages
```
Navigate to these URLs and verify they load:
- Home: http://localhost:5173/
- Register: http://localhost:5173/register
- Voter Login: http://localhost:5173/voter/login
- Vote: http://localhost:5173/vote
- Results: http://localhost:5173/results
- Admin Login: http://localhost:5173/admin/login
```

### Test Voter Registration Flow
1. Go to `http://localhost:5173/register`
2. Fill voter details:
   - Name: "Test Voter"
   - Aadhaar: "123456789012" (exactly 12 digits)
   - DOB: "01/01/2000" (must be 18+)
   - Email: "test@example.com"
   - Password: "SecurePass123" (8+ chars)
3. Click "Next" → Capture Face
4. Click "Capture" → Allow camera
5. Review details → Submit
6. Should see Token Number (e.g., "654321")

### Test Voter Login & Profile
1. Go to `http://localhost:5173/voter/login`
2. Login with registered email/password
3. Go to `http://localhost:5173/voter/profile`
4. Should show voter details and voting status

### Test Voting Flow
1. Go to `http://localhost:5173/vote`
2. Enter voter details (from registration):
   - Token Number: "654321"
   - Aadhaar: "123456789012"
   - Full Name: "Test Voter"
   - DOB: "01/01/2000"
3. Click "Next" → Capture face for verification
4. Select a candidate from the list
5. Review and confirm → Cast vote
6. Should show success message

### Test Admin Dashboard
```
URL: http://localhost:5173/admin/login
Email: admin@voting.com
Password: Admin@123456
```

In Dashboard, verify:
- Voter list shows registered voters
- Candidates show correct names
- Vote count updates after casting vote
- Can declare results
- Results page shows winner

### Test Results
1. As admin, declare results: Dashboard → "Declare Results"
2. Go to `http://localhost:5173/results`
3. Should show:
   - Winner candidate with most votes
   - Vote distribution chart
   - Percentage breakdown
   - Total votes cast

### Test Face Detection (Critical)
1. Register voter with clear face photo
2. During voting, capture face for verification
3. Browser console (F12) should show no 404 errors
4. Verification should succeed/fail based on face match
5. If face doesn't match, you won't be able to vote

---

## 📞 Still Stuck?

### Check These First:
1. **Error Message?** Search this file for the message
2. **Console Errors?** Open browser DevTools (F12) → Console
3. **Terminal Output?** Check for stack traces during install/run
4. **Port Conflicts?** Running both servers? (backend 5000, frontend 5173)
5. **MongoDB Running?** Check with `mongod --version` or `db.adminCommand('ping')`
6. **Two Terminals?** Both `npm run dev` commands running in separate terminals?

### Database Issues?
1. Check database is running: `mongosh --eval "db.adminCommand('ping')"`
2. Check MongoDB URI in backend/.env is correct
3. Verify database has data: Backend should have created admin + candidates

### Frontend/Backend Not Communicating?
1. Both servers running? Terminal 1: Backend, Terminal 2: Frontend
2. Check FRONTEND_URL in backend/.env matches frontend running port
3. Check api.ts has correct backend URL: `http://localhost:5000/api`
4. Check CORS in backend server.js is enabled

### Database Reset Required?
```bash
# If database is corrupted or has duplicate issues:
cd backend
npm run reset-seed

# Creates fresh database with:
# - Admin user: admin@voting.com / Admin@123456
# - 3 sample candidates
# WARNING: This deletes all existing data!
```

### Complete Fresh Start:
```bash
# Kill all node processes
# Windows:
taskkill /F /IM node.exe

# Mac/Linux:
killall node

# Remove all dependencies
cd backend && rm -rf node_modules package-lock.json
cd ../frontend && rm -rf node_modules package-lock.json

# Reinstall
cd backend && npm install
cd ../frontend && npm install

# Reconfigure environment
cd backend && cp .env.example .env
# Edit .env with your MongoDB URI

# Seed database
cd backend && npm run seed

# Start servers
# Terminal 1: cd backend && npm run dev
# Terminal 2: cd frontend && npm run dev
```

### Check Versions:
```bash
node -v   # Should be v16 or higher
npm -v    # Should be v8 or higher
mongosh --version  # MongoDB shell
```

### Clear All Caches:
```bash
# NPM cache
npm cache clean --force

# Browser cache
# Chrome: Ctrl+Shift+Delete
# Firefox: Ctrl+Shift+Delete
# Or use Incognito/Private mode

# Frontend build
rm -rf frontend/dist
```

### Check Logs:
- **Backend:** Look for error messages in terminal running `npm run dev`
- **Frontend:** Browser console (F12 → Console tab)
- **Database:** Check MongoDB connection logs if running locally

### Check File Permissions (Mac/Linux):
```bash
# Make scripts executable
chmod +x backend/scripts/seed.js
chmod +x setup.sh
```

---

## ✅ All Working?

Great! Now you can:

### Try All Features:
- **Register** as voter at `/register` (with face capture)
- **Login** as voter at `/voter/login`
- **Vote** at `/vote` (with face verification)
- **Admin Login** at `/admin/login` (admin@voting.com / Admin@123456)
- **View Results** at `/results` (after admin declares results)

### Admin Features to Try:
- Add/delete candidates
- View voter profiles
- View all cast votes
- Declare election results
- Reset election for testing

### Test Scenarios:
1. Multiple voters registering
2. Face verification during voting
3. Vote counting accuracy
4. Admin result declaration
5. One vote per voter enforcement
6. Aadhaar uniqueness validation

### Next Steps:
- Read [README.md](README.md) - Quick start & features
- Check [DOCUMENTATION.md](DOCUMENTATION.md) - Navigation guide
- Study [PROJECT_COMPLETE_DOCUMENTATION.md](PROJECT_COMPLETE_DOCUMENTATION.md) - Deep technical dive
- Explore code in `backend/src/` and `frontend/src/`
- Customize for your specific use case

### Database Management Scripts:
```bash
cd backend

# Fresh setup (creates admin + 3 candidates)
npm run seed

# Reset everything (deletes all data + recreates)
npm run reset-seed

# Fix Aadhaar hashing if inconsistent
npm run fix-aadhaar
```

### Common Customizations:
- **Change candidates:** Admin Dashboard → Add/Delete candidates
- **Change admin password:** Modify backend code or database directly
- **Change colors:** Edit `frontend/tailwind.config.js`
- **Add/Remove pages:** Modify `frontend/src/App.tsx` routing
- **Change validation rules:** Edit `frontend/src/utils/validation.ts`

**Enjoy your election voting system! 🎉**

---

**Last Updated:** June 2026  
**For:** College Demonstration Project  
**Built With:** React + Node.js + MongoDB + Face-API.js
