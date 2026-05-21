#!/bin/bash

# Election Voting System - Automated Setup Script
# Run: bash setup.sh (Mac/Linux)

echo "🗳️  Election Voting System - Automated Setup"
echo "=============================================="
echo ""

# Check prerequisites
echo "✓ Checking prerequisites..."

if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install from https://nodejs.org/"
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo "❌ npm not found. Please install Node.js"
    exit 1
fi

echo "✓ Node.js $(node -v) found"
echo "✓ npm $(npm -v) found"
echo ""

# Check MongoDB
echo "⚠️  MongoDB:"
if command -v mongod &> /dev/null; then
    echo "✓ MongoDB found (local installation)"
else
    echo "⚠️  MongoDB not found locally"
    echo "   You can use MongoDB Atlas (cloud) instead"
    echo "   Sign up at: https://www.mongodb.com/cloud/atlas"
fi
echo ""

# Setup Backend
echo "📦 Setting up Backend..."
cd backend

if [ ! -f ".env" ]; then
    echo "   Creating .env from template..."
    cp .env.example .env
    echo "   ✓ .env created - Please edit with your MongoDB URI"
    echo "   Edit: nano backend/.env"
else
    echo "   ✓ .env already exists"
fi

echo "   Installing dependencies..."
npm install > /dev/null 2>&1

if [ $? -eq 0 ]; then
    echo "   ✓ Backend dependencies installed"
else
    echo "   ❌ Failed to install backend dependencies"
    exit 1
fi

# Seed database
echo ""
echo "🌱 Seeding database with admin & sample data..."
npm run seed

echo ""
cd ..

# Setup Frontend
echo "📦 Setting up Frontend..."
cd frontend

echo "   Installing dependencies..."
npm install > /dev/null 2>&1

if [ $? -eq 0 ]; then
    echo "   ✓ Frontend dependencies installed"
else
    echo "   ❌ Failed to install frontend dependencies"
    exit 1
fi

cd ..

echo ""
echo "✅ Setup Complete!"
echo ""
echo "🚀 Next Steps:"
echo "   1. Edit backend/.env with your MongoDB URI"
echo "   2. Open Terminal 1: cd backend && npm run dev"
echo "   3. Open Terminal 2: cd frontend && npm run dev"
echo "   4. Open browser: http://localhost:5173"
echo ""
echo "🔑 Demo Credentials:"
echo "   Email: admin@voting.com"
echo "   Password: Admin@123456"
echo ""
echo "📚 For detailed guide, see QUICK_START.md"
