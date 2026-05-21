# Election Voting System - Frontend

React 18 + TypeScript + Vite SPA with Tailwind CSS and shadcn/ui components.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Start development server:
```bash
npm run dev
```

The frontend will be available at `http://localhost:5173`

## Environment

Make sure the backend is running at `http://localhost:5000/api`

## Features

- User registration with multi-step form
- Facial recognition (face-api.js integration)
- Voter verification and voting
- Real-time election results
- Admin dashboard with management tools
- JWT-based authentication
- Responsive dark theme with Framer Motion animations

## Project Structure

- `src/pages/` - Route pages (Home, Register, Vote, Results, Admin)
- `src/components/` - Reusable React components
- `src/context/` - React Context for auth state
- `src/hooks/` - Custom React hooks
- `src/utils/` - API clients and utilities
- `src/types/` - TypeScript interfaces
