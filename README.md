# 🗳️ Election Voting System with Facial Recognition

A complete full-stack voting application with advanced facial recognition security, built for college demonstration purposes.

---

## 🚀 Quick Setup

### Quick Commands (if you know what you're doing):
```bash
# Clone from GitHub
git clone https://github.com/YOUR_USERNAME/election-voting-system.git
cd election-voting-system

# Backend setup
cd backend && cp .env.example .env && npm install && npm run seed

# Frontend setup
cd ../frontend && npm install

# Terminal 1: cd backend && npm run dev     # Port 5000
# Terminal 2: cd frontend && npm run dev    # Port 5173

# Open: http://localhost:5173
```

**Demo Credentials:**
- Email: `admin@voting.com`  
- Password: `Admin@123456`

---

## 📚 Documentation

- **[SETUP_TROUBLESHOOTING.md](SETUP_TROUBLESHOOTING.md)** - Fix common errors
- **[DOCUMENTATION.md](DOCUMENTATION.md)** - All guides at a glance
- **[PROJECT_COMPLETE_DOCUMENTATION.md](PROJECT_COMPLETE_DOCUMENTATION.md)** - Technical deep-dive
- **[backend/README.md](backend/README.md)** - Backend API documentation
- **[frontend/README.md](frontend/README.md)** - Frontend structure

---

## 🌟 Features

- **Facial Recognition Security** - face-api.js powered face detection and verification
- **Aadhaar Verification** - Secure identity verification with SHA-256 hashing
- **JWT Authentication** - Secure token-based authentication with bcrypt password hashing
- **Multi-Step Registration** - Guided registration with face capture and data review
- **Real-Time Voting** - Multi-step voting process with candidate selection and confirmation
- **Live Results** - Real-time election results with charts and analytics
- **Admin Dashboard** - Complete election management and monitoring tools
- **Modern UI** - Dark theme with glass-morphism, Framer Motion animations, and responsive design
- **One Vote Per User** - Voter fraud prevention with facial recognition verification

## 🏗️ Tech Stack

### Frontend
- **React 18** - UI framework with TypeScript
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Smooth animations and transitions
- **Recharts** - Data visualization
- **face-api.js** - Browser-based facial recognition
- **Axios** - HTTP client
- **Sonner** - Toast notifications

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **MongoDB** - Document database with Mongoose ODM
- **JWT** - JSON Web Tokens for authentication
- **bcryptjs** - Password hashing
- **CORS** - Cross-origin resource sharing

## 📁 Project Structure

```
election-voting-system/
├── frontend/               # React + Vite SPA
│   ├── src/
│   │   ├── pages/         # Route pages
│   │   ├── components/    # Reusable components
│   │   ├── context/       # React Context (Auth)
│   │   ├── hooks/         # Custom React hooks
│   │   ├── utils/         # API & face-api utilities
│   │   ├── types/         # TypeScript interfaces
│   │   └── App.tsx        # Main app component
│   ├── public/            # Static assets & face-api models
│   └── package.json
│
├── backend/               # Express API server
│   ├── src/
│   │   ├── models/        # Mongoose schemas
│   │   ├── routes/        # API endpoints
│   │   ├── controllers/   # Route handlers
│   │   ├── middleware/    # Auth & validation
│   │   ├── utils/         # Helper functions
│   │   └── config/        # Database config
│   ├── scripts/
│   │   └── seed.js        # Database seeding
│   ├── server.js          # Express server entry
│   └── package.json
│
└── .github/
    └── copilot-instructions.md
```

## 🚀 Quick Start (3 Steps)

### Step 1: Install Dependencies
```bash
# Windows - Run setup script
.\setup.ps1

# Mac/Linux - Install manually
cd backend && npm install
cd ../frontend && npm install
```

### Step 2: Start Everything
```bash
# Windows - Run startup script (opens 2 terminals automatically)
.\start-app.ps1

# Mac/Linux - Start manually
# Terminal 1: Backend
cd backend && npm run seed && npm run dev

# Terminal 2: Frontend  
cd frontend && npm run dev
```

### Step 3: Access the Application
- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:5000/api
- **Admin Login:** admin@voting.com / Admin@123456

## ✅ Complete Setup Guide

For detailed setup instructions, environment configuration, and troubleshooting:
📖 See [SETUP_GUIDE.md](SETUP_GUIDE.md)

## 🧪 Testing & Verification

For comprehensive testing procedures and verification checklist:
📋 See [TESTING_GUIDE.md](TESTING_GUIDE.md)

## 🔧 Recent Fixes & Improvements

Complete list of all issues fixed and improvements made:
🔨 See [FIXES_APPLIED.md](FIXES_APPLIED.md)
JWT_SECRET=your-secret-key-here
PORT=5000
FRONTEND_URL=http://localhost:5173
```

4. Install dependencies:
```bash
npm install
```

5. Seed initial data (admin user + sample candidates):
```bash
npm run seed
```

6. Start development server:
```bash
npm run dev
```

Backend running at `http://localhost:5000`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start development server:
```bash
npm run dev
```

Frontend available at `http://localhost:5173`

## 📚 API Routes

### Authentication
- `POST /api/auth/register` - Register user with face data
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (JWT protected)

### Profiles
- `GET /api/profiles/:userId` - Get user profile
- `GET /api/profiles` - Get all profiles (admin only)
- `DELETE /api/profiles/:id` - Delete profile (admin only)
- `POST /api/profiles/verify-face` - Verify voter by face

### Candidates
- `GET /api/candidates` - Get all candidates
- `POST /api/candidates` - Add candidate (admin only)
- `DELETE /api/candidates/:id` - Delete candidate (admin only)

### Votes
- `POST /api/votes` - Cast vote
- `GET /api/votes` - Get all votes (admin only)

### Results
- `GET /api/results/status` - Check if results declared
- `GET /api/results` - Get election results
- `POST /api/results/declare` - Declare results (admin only)
- `POST /api/results/reset` - Reset election (admin only)

## 🔐 Security Features

- **JWT Tokens** - Secure token-based authentication
- **Password Hashing** - bcryptjs with salt rounds of 10
- **Aadhaar Hashing** - SHA-256 hashing of sensitive data
- **Face Recognition** - Euclidean distance matching (threshold < 0.6)
- **Role-Based Access** - Admin-only routes protected with middleware
- **One Vote Per User** - Enforced by checking `hasVoted` flag with face verification
- **CORS** - Configured for frontend-backend communication

## 🎨 UI Pages

### Public Pages
- **Home** - Landing page with feature cards and navigation
- **Register** - Multi-step registration with face capture
- **Vote** - Voter verification → Candidate selection → Confirmation
- **Results** - Winner card and result analytics

### Admin Pages
- **Admin Login** - Email/password authentication
- **Admin Dashboard** - Stats, voter management, candidate management, analytics

## 👨‍💻 Demo Credentials

After running `npm run seed` in backend:

**Admin Account:**
- Email: `admin@voting.com`
- Password: `Admin@123456`

**Sample Candidates:**
- Dr. Rajesh Kumar - National Democratic Alliance
- Ms. Priya Singh - United Progressive Alliance
- Mr. Amit Patel - Bharatiya Janata Party

## 🧪 Testing Workflow

1. Register as a voter
2. Note your token number
3. Cast your vote using token number + face verification
4. Login as admin to view dashboard
5. Declare results to see election winner
6. Manage candidates and voters from admin panel

## 📋 Database Models

### User
- email (unique)
- password (bcrypt hashed)
- role ("user" | "admin")
- createdAt

### Profile
- userId (reference to User)
- fullName
- aadhaarHash
- dateOfBirth
- tokenNumber (6-digit, unique)
- faceData { image (base64), descriptor (128-d array) }
- hasVoted (boolean)
- createdAt

### Candidate
- name
- party
- photo (optional)
- voteCount
- createdAt

### Vote
- voterId (reference to Profile)
- candidateId (reference to Candidate)
- createdAt

### Setting
- key (unique)
- value
- updatedAt

## 🔄 Election Flow

1. **Registration**: User registers with personal details, Aadhaar, DOB, email, password, and face capture
2. **Voter Verification**: User enters token number, Aadhaar, name, DOB, and captures face for verification
3. **Face Matching**: System compares captured face descriptor with stored descriptor (Euclidean distance < 0.6)
4. **Voting**: Verified user selects candidate and confirms vote
5. **Results**: Admin declares results showing winner and vote distribution

## 🎓 College Demo Features

- No external API dependencies (face-api.js runs locally)
- Demo data included (3 sample candidates)
- One-click database seeding
- Dark theme suitable for presentations
- Smooth animations and transitions
- Responsive design for different screen sizes

## 📝 Environment Variables

### Backend (.env)
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/election_voting
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

### Frontend Configuration
- API endpoint: `http://localhost:5000/api`
- Configured in `src/utils/api.ts`

## 🚀 Deployment Considerations

- Deploy backend to cloud (Heroku, Railway, Render)
- Deploy frontend to Vercel or Netlify
- Use MongoDB Atlas for database
- Update CORS settings for production URLs
- Use environment-specific JWT secrets
- Enable HTTPS for production

## 📖 Additional Notes

- Face-api.js models should be placed in `frontend/public/models/`
- Models can be downloaded from: https://github.com/justadudewhohacks/face-api.js/tree/master/weights
- For college demo, consider limiting to 50-100 voters
- Admin dashboard provides complete oversight of election process
- One vote per user is enforced by facial recognition verification

## 📞 Support

This is a college demonstration project. For features or issues, refer to the codebase structure and modify as needed for your use case.

---

**Built for college demonstration purposes** 🎓
