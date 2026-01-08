#!/bin/bash

# StreamIt Admin Panel - Development Setup Script

set -e

echo "🎯 StreamIt Admin Panel - Development Setup"
echo ""

# Check for Bun
if ! command -v bun &> /dev/null; then
    echo "❌ Bun is not installed. Please install Bun first:"
    echo "   curl -fsSL https://bun.sh/install | bash"
    exit 1
fi

echo "✅ Bun is installed"

# Check for PostgreSQL
if ! command -v psql &> /dev/null; then
    echo "⚠️  PostgreSQL is not installed. Please install PostgreSQL first."
    exit 1
fi

echo "✅ PostgreSQL is installed"

echo ""
echo "📦 Installing backend dependencies..."
cd admin-backend
bun install

echo ""
echo "📦 Installing frontend dependencies..."
cd ../admin-frontend
bun install

echo ""
echo "🗄️ Setting up database..."
cd ../admin-backend

# Check if .env exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cp .env.development .env
    echo "⚠️  Please update .env with your database credentials!"
fi

echo "🔄 Generating Prisma Client..."
bunx prisma generate

echo "🚀 Running database migrations..."
bunx prisma migrate dev

echo ""
echo "✨ Setup complete!"
echo ""
echo "To start development:"
echo ""
echo "Terminal 1 (Backend):"
echo "  cd admin-backend && bun run dev"
echo ""
echo "Terminal 2 (Frontend):"
echo "  cd admin-frontend && bun run dev"
echo ""
echo "Then open http://localhost:3001 in your browser"
echo ""
