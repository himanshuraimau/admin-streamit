#!/bin/bash

set -e  # Exit on error

echo "🚀 Starting deployment..."

# Navigate to project directory
cd ~/streamit-admin

# Pull latest code
echo "📥 Pulling latest code..."
git pull origin main

# Update backend
echo "🔧 Updating backend..."
cd admin-backend
bun install
bun db:generate
bun db:migrate:deploy

# Restart backend
echo "♻️  Restarting backend..."
pm2 restart streamit-backend

# Update frontend
echo "🎨 Building frontend..."
cd ../admin-frontend
bun install
bun run build

# Reload Nginx
echo "🔄 Reloading Nginx..."
sudo systemctl reload nginx

echo "✅ Deployment complete!"
echo "🌐 Frontend: https://app.vidrelay.site"
echo "🔌 Backend: https://api.vidrelay.site"

# Show backend status
pm2 status streamit-backend
