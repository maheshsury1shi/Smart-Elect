# Election Voting System - Backend

Node.js + Express API server with MongoDB and JWT authentication.

## Setup

1. Copy `.env.example` to `.env` and update values:
```bash
cp .env.example .env
```

2. Update `.env` with your MongoDB connection string and JWT secret.

3. Install dependencies:
```bash
npm install
```

4. Seed initial data:
```bash
npm run seed
```

5. Start development server:
```bash
npm run dev
```

## API Endpoints

### Auth
- `POST /api/auth/register` - Register new user with face data
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (requires JWT)

### Profiles
- `GET /api/profiles/:userId` - Get user profile
- `GET /api/profiles` - Get all profiles (admin only)
- `DELETE /api/profiles/:id` - Delete profile (admin only)
- `POST /api/profiles/verify-face` - Verify voter by face recognition

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

## Environment Variables

- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - Secret key for JWT tokens
- `PORT` - Server port (default: 5000)
- `FRONTEND_URL` - Frontend URL for CORS
