# 🗳️ How to Run Election Voting System on Your Machine

**Complete guide to get the project running - from GitHub clone or .zip file**

> Last updated: May 2026 | For: College Voting Demo Application

---

## 📥 Step 1: Get the Project Code

Choose ONE method below:

### Option A: Clone from GitHub (Recommended) 🚀

```bash
# Open Terminal/Command Prompt and run:
git clone https://github.com/YOUR_USERNAME/election-voting-system.git
cd election-voting-system
```

**Requirements:** Git installed
- Windows/Mac/Linux: Download from https://git-scm.com/

### Option B: Download as .zip File 📦

1. Go to: https://github.com/YOUR_USERNAME/election-voting-system
2. Click green **Code** button
3. Click **Download ZIP**
4. Extract the folder
5. Open Terminal/Command Prompt in the extracted folder

---

## ✅ Step 2: Check Prerequisites

Your computer needs these installed:

### Check Node.js (Required)
```bash
node --version
npm --version
```

Should show versions like `v16.0.0` or higher. If not:
👉 **Install from:** https://nodejs.org/ (LTS version)

### Check MongoDB (Required)

**Option 1: Local MongoDB**
```bash
mongod --version
```

If not installed:
- **Windows:** https://docs.mongodb.com/manual/tutorial/install-mongodb-on-windows/
- **Mac:** `brew install mongodb-community`
- **Linux:** `sudo apt-get install mongodb`

**Option 2: MongoDB Atlas (Cloud)** ✨ Easier!
1. Sign up free at: https://www.mongodb.com/cloud/atlas
2. Create a cluster
3. Get connection string (we'll use it in Step 4)

---

## 🔧 Step 3: Setup Backend

### 3A. Go to Backend Folder
```bash
cd backend
```

### 3B. Create Environment File
Copy the example file to create your `.env`:

**Windows (PowerShell):**
```powershell
Copy-Item .env.example .env
```

**Mac/Linux (Terminal):**
```bash
cp .env.example .env
```

### 3C. Edit `.env` File

Open `backend/.env` in any text editor and update:

```env
# If using LOCAL MongoDB:
MONGODB_URI=mongodb://localhost:27017/election_voting

# If using MONGODB ATLAS (Cloud):
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/election_voting

# Keep these as is:
JWT_SECRET=mysecretkey123456789
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

> **Need help?** See [SETUP_TROUBLESHOOTING.md](SETUP_TROUBLESHOOTING.md)

### 3D. Install Dependencies
```bash
npm install
```

This downloads all backend packages (may take 1-2 minutes).

### 3E. Seed Database (Create Demo Data)
```bash
npm run seed
```

This creates:
- Admin user: `admin@voting.com` / `Admin@123456`
- 3 sample candidates
- Database tables

**Output should show:** ✅ Database seeded successfully

---

## 🎨 Step 4: Setup Frontend

### 4A. Go to Frontend Folder
```bash
# From backend folder, go up first
cd ..

# Then go to frontend
cd frontend
```

### 4B. Install Dependencies
```bash
npm install
```

Takes 1-2 minutes.

### 4C. Check Face-API Models

The face recognition models should already be in:
```
frontend/public/models/
```

These files should exist:
- `tiny_face_detector_model-*`
- `face_landmark_68_model-*`
- `face_recognition_model-*`
- Other model files

> **If missing?** See [SETUP_TROUBLESHOOTING.md](SETUP_TROUBLESHOOTING.md)

---

## 🚀 Step 5: Start the Project

You need **2 terminals** running at the same time!

### Terminal 1: Start Backend Server

```bash
cd backend
npm run dev
```

**Expected output:**
```
✓ Server running on http://localhost:5000
✓ Connected to MongoDB
```

### Terminal 2: Start Frontend Server

```bash
cd frontend
npm run dev
```

**Expected output:**
```
Local: http://localhost:5173
```

> **Can't open 2 terminals?** See [SETUP_TROUBLESHOOTING.md](SETUP_TROUBLESHOOTING.md)

---

## 💻 Step 6: Open in Browser

Open your web browser and go to:

```
http://localhost:5173
```

You should see the **Election Voting System** homepage!

---

## 🔐 Step 7: Login as Admin (Test)

1. Click **Admin Login** on homepage
2. Enter credentials:
   - **Email:** `admin@voting.com`
   - **Password:** `Admin@123456`
3. You should see the **Admin Dashboard**

---

## 🧪 Step 8: Test the Features

### Register as Voter
1. Go back to home page
2. Click **Register as Voter**
3. Fill in details
4. **Capture Face** - Show your face to camera
5. Submit

### Vote
1. Click **Vote**
2. Enter your details (same as registered)
3. **Face Verification** - Camera verifies your face
4. Select candidate and vote
5. Submit

### View Results
1. Click **Results**
2. See live vote counts

---

## ❓ Troubleshooting

### Problem: "Cannot connect to MongoDB"
**Solution:** 
- Make sure MongoDB is running: `mongod` command
- OR use MongoDB Atlas connection string in `.env`
- Check your MONGODB_URI in `.env` file

### Problem: "Port 5000 already in use"
**Solution:**
```bash
# Windows - Kill the process
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Mac/Linux - Kill the process
lsof -i :5000
kill -9 <PID>
```

### Problem: "Port 5173 already in use"
**Solution:** Same as above but for port 5173

### Problem: "npm: command not found"
**Solution:**
- Install Node.js from https://nodejs.org/
- Restart your terminal/command prompt

### Problem: "Cannot find module 'express'"
**Solution:**
```bash
cd backend
rm -rf node_modules package-lock.json
npm install
```

### Problem: "Face models not loading"
**Solution:**
- Check models exist in `frontend/public/models/`
- Open browser console (F12) to see error
- Restart frontend: `npm run dev`

### Problem: "Camera permission denied"
**Solution:**
- Click camera icon in browser address bar and allow access
- Restart browser if needed
- Try incognito/private mode

### More issues?
👉 Read [SETUP_TROUBLESHOOTING.md](SETUP_TROUBLESHOOTING.md) for detailed solutions

---

## 📊 What Each Command Does

| Command | Location | What it Does |
|---------|----------|------------|
| `npm install` | backend or frontend | Downloads all required packages |
| `npm run seed` | backend | Creates demo admin user and candidates |
| `npm run dev` | backend | Starts Express API server on port 5000 |
| `npm run dev` | frontend | Starts React dev server on port 5173 |
| `git clone [url]` | anywhere | Downloads project from GitHub |
| `cp .env.example .env` | backend | Creates environment configuration file |

---

## 🎯 Quick Reference

### URLs After Running
- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:5000/api
- **Admin Dashboard:** http://localhost:5173/admin/login

### Default Credentials
- **Email:** admin@voting.com
- **Password:** Admin@123456

### Important Files
- **Backend config:** `backend/.env`
- **Face models:** `frontend/public/models/`
- **Database script:** `backend/scripts/seed.js`

### Important Ports
- **Backend:** 5000
- **Frontend:** 5173
- **MongoDB:** 27017 (if local)

---

## 📁 Project Structure (What Each Folder Does)

```
election-voting-system/
├── backend/                    # Express API server
│   ├── .env                   # Configuration (create from .env.example)
│   ├── server.js              # Main server file
│   ├── src/
│   │   ├── models/            # Database schemas
│   │   ├── routes/            # API endpoints
│   │   ├── controllers/       # Business logic
│   │   └── middleware/        # Authentication
│   └── scripts/
│       └── seed.js            # Create demo data
│
├── frontend/                   # React web app
│   ├── public/models/         # Face-API models (must exist!)
│   ├── src/
│   │   ├── pages/             # Website pages
│   │   ├── components/        # React components
│   │   ├── utils/             # Face detection & API code
│   │   └── App.tsx            # Main app
│   └── vite.config.ts         # Build configuration
│
└── Root files
    ├── .env.example           # Template for backend/.env
    ├── .gitignore             # Tells git what to ignore
    ├── README.md              # Project overview
    ├── QUICK_START.md         # 5-minute guide
    ├── SETUP_TROUBLESHOOTING.md  # Solutions for errors
    └── RUN_ON_YOUR_MACHINE.md    # This file!
```

---

## ✨ Features Overview

### What Can You Do?

1. **Register as a Voter**
   - Enter personal details
   - Capture your face with camera
   - Get voter token

2. **Vote**
   - Verify with face + details
   - Select candidate to vote for
   - Vote recorded

3. **View Results**
   - See live vote counts
   - See winning candidate

4. **Admin Panel**
   - Manage candidates
   - View all voters
   - See voting statistics
   - Declare results

---

## 🔐 Security Features

This project includes:
- ✅ **Face Recognition** - Prevents impersonation
- ✅ **Password Hashing** - Passwords encrypted
- ✅ **JWT Tokens** - Secure session management
- ✅ **One Vote Per Person** - Prevents duplicate voting
- ✅ **Admin Only Access** - Protected endpoints

---

## 🎬 Typical Workflow

```
1. Open http://localhost:5173
   ↓
2. Register as voter → Capture face → Get token
   ↓
3. Vote → Verify face → Select candidate → Submit
   ↓
4. View results
   ↓
5. Admin login (admin@voting.com) → Manage election
```

---

## ⚠️ Important Notes

- **Keep `.env` file safe** - Contains database secrets
- **Don't share `.env` publicly** - It's in `.gitignore` for security
- **First start takes longer** - MongoDB creates collections
- **Face models are large** - Don't delete `frontend/public/models/`
- **Both servers must run** - Frontend (5173) + Backend (5000)

---

## 📚 Need More Help?

| Question | Read This |
|----------|-----------|
| "How do I fix this error?" | [SETUP_TROUBLESHOOTING.md](SETUP_TROUBLESHOOTING.md) |
| "How do I understand the code?" | [PROJECT_COMPLETE_DOCUMENTATION.md](PROJECT_COMPLETE_DOCUMENTATION.md) |
| "What's the full architecture?" | [backend/README.md](backend/README.md) + [frontend/README.md](frontend/README.md) |
| "Everything explained" | [DOCUMENTATION.md](DOCUMENTATION.md) |
| "Ready to publish?" | [GITHUB_SETUP.md](GITHUB_SETUP.md) |

---

## 🎉 Success Checklist

After following this guide, you should have:

- [ ] Project downloaded or cloned
- [ ] Node.js installed and working
- [ ] MongoDB running (local or Atlas)
- [ ] `backend/.env` created and configured
- [ ] `npm install` completed in both folders
- [ ] `npm run seed` ran successfully
- [ ] Backend server running on port 5000
- [ ] Frontend server running on port 5173
- [ ] Can open http://localhost:5173 in browser
- [ ] Can login with admin@voting.com / Admin@123456
- [ ] Can register a voter
- [ ] Can cast a vote

**If all checked:** 🎊 PROJECT IS RUNNING!

---

## 🚀 Next Steps

After getting it running:

1. **Customize it** - Change candidates, colors, text
2. **Deploy it** - Put on internet (see DEPLOYMENT.md if created)
3. **Share it** - Show friends and family
4. **Improve it** - Add features, fix issues
5. **Document it** - Share your modifications

---

## 💬 Still Need Help?

1. **Check [SETUP_TROUBLESHOOTING.md](SETUP_TROUBLESHOOTING.md)** - Most errors are covered
2. **Check browser console** - Press F12 to see errors
3. **Check terminal output** - Read error messages carefully
4. **Restart everything** - Sometimes works!
5. **Delete and reinstall** - Last resort:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   npm run seed
   npm run dev
   ```

---

## 📞 Common Questions

**Q: Do I need to pay for anything?**
A: No! Everything is free. MongoDB Atlas has a free tier.

**Q: Can I use this for production?**
A: Yes, but need to secure and deploy properly (see DEPLOYMENT.md).

**Q: Can I modify the code?**
A: Yes! It's fully open source. Change anything you want.

**Q: Does it work offline?**
A: Backend and Frontend yes, but MongoDB Atlas needs internet.

**Q: Can multiple people use it at the same time?**
A: Yes! That's the beauty of it. Many voters can register and vote.

**Q: What if I mess something up?**
A: No problem! Just:
   ```bash
   npm run seed  # Recreates demo data
   ```

---

## ✅ You're Ready!

Everything you need to know to run this project is in this file. 

**Now go clone/download and run it! 🚀**

---

**Questions?** Check [SETUP_TROUBLESHOOTING.md](SETUP_TROUBLESHOOTING.md)  
**Want details?** Check [PROJECT_COMPLETE_DOCUMENTATION.md](PROJECT_COMPLETE_DOCUMENTATION.md)  
**Publishing to GitHub?** Check [GITHUB_SETUP.md](GITHUB_SETUP.md)

---

*Created for Election Voting System - College Demo*  
*Last Updated: May 2026*
