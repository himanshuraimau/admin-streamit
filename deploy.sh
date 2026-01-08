#!/bin/bash

# StreamIt Admin Panel - Deployment Script

set -e

echo "🚀 Starting deployment process..."

# Backend deployment
echo "📦 Building backend..."
cd admin-backend
bun install --production
bun run build

echo "🗄️ Running database migrations..."
bunx prisma migrate deploy
bunx prisma generate

echo "✅ Backend build complete!"

# Frontend deployment
echo "📦 Building frontend..."
cd ../admin-frontend
bun install --production
bun run build

echo "✅ Frontend build complete!"

cd ..

echo ""
echo "✨ Deployment complete!"
echo ""
echo "Next steps:"
echo "1. Backend: Deploy the admin-backend/ folder to your server"
echo "2. Frontend: Deploy the admin-frontend/dist/ folder to your CDN/hosting"
echo "3. Set up environment variables on your hosting platform"
echo "4. Configure your domain and SSL certificates"
echo ""
