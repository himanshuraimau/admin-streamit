# Backend Deployment Guide

## Environment Setup

Create `.env` file:

```env
DATABASE_URL="postgresql://streamit_admin:PASSWORD@localhost:5432/streamit"
JWT_SECRET="your-secure-jwt-secret-min-32-chars"
PORT=4000
NODE_ENV=production
ALLOWED_ORIGINS="https://app.vidreplay.site"
ADMIN_FRONTEND_URL="https://app.vidreplay.site"
```

Generate JWT secret:
```bash
openssl rand -base64 32
```

## Database Setup

```bash
# Connect to PostgreSQL
sudo -u postgres psql

# Create database and user
CREATE DATABASE streamit;
CREATE USER streamit_admin WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE streamit TO streamit_admin;
\c streamit
GRANT ALL ON SCHEMA public TO streamit_admin;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO streamit_admin;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO streamit_admin;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO streamit_admin;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO streamit_admin;
\q
```

## Installation

```bash
cd admin-backend
bun install
bun db:generate
bun db:migrate:deploy
bun db:seed  # Creates admin user
```

## Running

**Development:**
```bash
bun dev
```

**Production (PM2):**
```bash
pm2 start ecosystem.config.js
pm2 save
```

## Nginx Configuration

File: `/etc/nginx/sites-available/api.vidreplay.site`

```nginx
server {
    listen 80;
    server_name api.vidreplay.site;

    location / {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable and reload:
```bash
sudo ln -s /etc/nginx/sites-available/api.vidreplay.site /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## SSL Setup

```bash
sudo certbot --nginx -d api.vidreplay.site
```

## Health Check

```bash
curl https://api.vidreplay.site/health
```

## Default Admin Credentials

```
Email: admin@streamit.com
Password: Admin@123456
```

**⚠️ Change immediately after first login!**
