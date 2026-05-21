# 🚀 Quick Start Guide - Election Voting System

Get the project running on your machine in **5 minutes**!

---

## ✅ Prerequisites

Install these first:
- **Node.js** (v16+) - [Download](https://nodejs.org/)
- **MongoDB** (local or cloud) - [MongoDB Community](https://www.mongodb.com/try/download/community) or [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)

> **Easier Option:** Use MongoDB Atlas (cloud) - no local installation needed!

---

## 📋 Step-by-Step Setup

### Step 1️⃣: Clone Repository
```bash
git clone https://github.com/YOUR_USERNAME/election-voting-system.git
cd election-voting-system
```

### Step 2️⃣: Setup Backend

```bash
cd backend

# Copy environment file
cp .env.example .env

# Edit .env with your MongoDB URI
# Windows: notepad .env
# Mac/Linux: nano .env
```

**Set these in `.env`:**
```env
MONGODB_URI=mongodb://localhost:27017/election_voting
# OR use MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/election_voting

JWT_SECRET=election_voting_secret_key_2024
PORT=5000
FRONTEND_URL=http://localhost:5173
```

**Install & Seed:**
```bash
# Install dependencies
npm install

# Seed database with admin user & sample data
npm run seed

# Output should show:
# ✅ Admin user created: admin@voting.com
# ✅ Database seeded successfully!
```

### Step 3️⃣: Setup Frontend

```bash
# From root directory
cd frontend

# Install dependencies
npm install

# No .env needed - frontend auto-connects to http://localhost:5000
```

### Step 4️⃣: Start Both Servers

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
# Output: Server running on http://localhost:5000
```

**Terminal 2 - Frontend (new terminal):**
```bash
cd frontend
npm run dev
# Output: Local: http://localhost:5173
```

### Step 5️⃣: Access Application

Open in browser:
- 🏠 **Home**: http://localhost:5173
- 📝 **Register**: http://localhost:5173/register
- 🗳️ **Vote**: http://localhost:5173/vote
- 📊 **Results**: http://localhost:5173/results
- 👨‍💼 **Admin**: http://localhost:5173/admin/login

---

## 🔑 Demo Credentials

After running `npm run seed`:

**Admin Dashboard:**
- Email: `admin@voting.com`
- Password: `Admin@123456`
- URL: http://localhost:5173/admin/login

**Sample Candidates (pre-loaded):**
- Dr. Rajesh Kumar
- Ms. Priya Singh  
- Mr. Amit Patel

---

## 📸 Testing the System

### Register a Voter
1. Go to http://localhost:5173/register
2. Fill in personal details
3. **Capture your face** (enable camera access)
4. Note your **Token Number** on success page

### Cast a Vote
1. Go to http://localhost:5173/vote
2. Enter: Token Number, Aadhaar, Name, DOB
3. **Capture face again** (must match registered face)
4. Select candidate
5. Confirm vote

### Admin Dashboard
1. Go to http://localhost:5173/admin/login
2. Enter: `admin@voting.com` / `Admin@123456`
3. View:
   - Total voters & votes
   - Voter management
   - Candidate management
   - Live vote counts
   - Declare results

---

## 🐛 Troubleshooting

### ❌ "Cannot find module" Error
```bash
# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### ❌ MongoDB Connection Error
- Check MongoDB is running: `mongod` or verify MongoDB Atlas connection string
- Verify `MONGODB_URI` in `.env` is correct

### ❌ Port Already in Use
```bash
# Change port in backend/.env
PORT=5001

# Or kill process using port 5000
# Windows: netstat -ano | findstr :5000
# Mac/Linux: lsof -i :5000 | kill -9 <PID>
```

### ❌ Face Detection Not Working
1. Check browser console (F12)
2. Grant camera permission
3. Ensure good lighting
4. Position face clearly in center

### ❌ "Models not found" Error
- Face-API models should be in `frontend/public/models/`
- They're included in the repo - no download needed

---

## 🎯 Quick Feature Test

```bash
# 1. Backend running? Check:
curl http://localhost:5000/api/candidates

# 2. Frontend running? Check:
# Visit http://localhost:5173 in browser

# 3. Database connected? Check:
# Admin dashboard should load candidate list
```

---

## 📁 Project Structure

```
election-voting-system/
├── backend/
│   ├── .env.example        ← Copy to .env
│   ├── package.json
│   ├── server.js           ← Express server
│   ├── scripts/seed.js     ← Run: npm run seed
│   └── src/
│
├── frontend/
│   ├── package.json
│   ├── vite.config.ts
│   ├── public/models/      ← Face-API models
│   └── src/
│
└── QUICK_START.md          ← This file!
```

---

## 🚀 Next Steps

After setup works:

1. **Explore Code** - Check `frontend/src/pages/Register.tsx` and `backend/src/controllers/`
2. **Customize** - Modify candidates, styling, features
3. **Deploy** - See [DEPLOYMENT.md](DEPLOYMENT.md) for cloud deployment
4. **Learn** - Review [PROJECT_COMPLETE_DOCUMENTATION.md](PROJECT_COMPLETE_DOCUMENTATION.md)

---

## 💡 Tips

- **Multiple users?** Run `npm run seed` again to reset and get new admin creds
- **Change admin password?** Edit backend code or use MongoDB compass
- **Production mode?** Set `NODE_ENV=production` in backend `.env`
- **Change theme?** Edit `frontend/tailwind.config.js` for colors

---

## 🆘 Still Stuck?

1. Check console for errors (F12 in browser)
2. Verify all prerequisites installed: `node -v`, `npm -v`, `mongod --version`
3. Ensure ports 5000 & 5173 are available
4. Check `.env` files are configured correctly

**Still not working?**
- Open an issue on GitHub
- Include error message and your OS

---

## ✨ You're Ready!

🎉 **Congratulations!** Your election voting system is now running!

Start by registering as a voter, then vote, then check admin dashboard. 🗳️

---

**Last Updated:** May 2024
**Built For:** College Demonstration
**Built With:** React + Node.js + MongoDB + Face-API.js
