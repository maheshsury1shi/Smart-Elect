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

# If still fails, manually set these env vars:
export MONGODB_URI=mongodb://localhost:27017/election_voting
export JWT_SECRET=mysecretkey123456789
npm run seed
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
1. Check models exist: `frontend/public/models/`
2. Should contain: `*_manifest.json` and `*_shard1` files
3. If missing, run: `npm run download-models` (if available)
4. Or copy manually from face-api.js repo

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

### Test Backend
```bash
# In terminal, test API:
curl http://localhost:5000/api/candidates

# Should return JSON array of candidates
```

### Test Frontend
```bash
# Open in browser:
http://localhost:5173

# Should load homepage without errors
```

### Test Database
```bash
# Check MongoDB is connected by checking Admin Dashboard:
http://localhost:5173/admin/login

# Login: admin@voting.com / Admin@123456
# Should show candidates in dashboard
```

### Test Face Detection
1. Register new voter - should capture face
2. Vote as that voter - should verify face
3. Check browser console (F12) for no errors

---

## 📞 Still Stuck?

### Check These First:
1. **Error Message?** Search this file for the message
2. **Console Errors?** Open browser DevTools (F12) → Console
3. **Terminal Output?** Check for stack traces during install/run
4. **Port Conflicts?** Run both servers? (need 5000 & 5173)
5. **MongoDB Running?** Check with `mongod --version`

### If Still Not Working:
1. **Delete everything and start fresh:**
   ```bash
   rm -rf node_modules package-lock.json .env
   npm install
   cp .env.example .env
   ```

2. **Check Node/npm versions:**
   ```bash
   node -v  # Should be v16+
   npm -v   # Should be v8+
   ```

3. **Clear all caches:**
   ```bash
   npm cache clean --force
   # For frontend: rm -rf frontend/dist frontend/node_modules
   ```

4. **Check logs:**
   - Backend: Look for error messages in terminal
   - Frontend: Browser console (F12)
   - Database: MongoDB logs if running locally

### Report Issue:
Include:
- Your OS (Windows/Mac/Linux)
- `node -v` output
- Error message (full stack trace)
- Steps to reproduce

---

## ✅ All Working?

Great! Now explore:
- Modify candidates in Admin Dashboard
- Register multiple voters
- Test face verification
- Try voting flow
- Check results declaration

**Next Steps:**
- Read [QUICK_START.md](QUICK_START.md) for features
- Check [PROJECT_COMPLETE_DOCUMENTATION.md](PROJECT_COMPLETE_DOCUMENTATION.md) for deep dive
- Customize the project for your needs!

---

Last Updated: May 2024
