# Docker Deployment Guide

Quick guide for deploying StreamIt Admin Dashboard using Docker.

## Prerequisites

- Docker & Docker Compose installed
- Neon PostgreSQL database (free tier available at [neon.tech](https://neon.tech))
- Domain configured (optional, for production)

## Quick Start

### 1. Setup Environment

```bash
# Copy environment template
cp .env.example .env

# Edit with your values
nano .env
```

**Required variables:**
- `DATABASE_URL` - Your Neon PostgreSQL connection string
- `JWT_SECRET` - Generate with: `openssl rand -base64 32`

### 2. Build and Run

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### 3. Run Database Migrations

```bash
# Run migrations (first time setup)
docker-compose exec backend bunx prisma migrate deploy

# Seed admin user
docker-compose exec backend bun run prisma/seed.ts
```

### 4. Access Application

- **Frontend**: http://localhost (or port specified in FRONTEND_PORT)
- **Backend**: http://localhost:4000 (or port specified in BACKEND_PORT)
- **Health Check**: http://localhost:4000/health

**Default Admin:**
- Email: `admin@streamit.com`
- Password: `Admin@123456`

## Environment Variables

### Required

```env
DATABASE_URL=postgresql://user:pass@host/db?sslmode=require
JWT_SECRET=your-secret-key-min-32-chars
```

### Optional

```env
# Ports
BACKEND_PORT=4000
FRONTEND_PORT=80

# Environment
NODE_ENV=production

# CORS
ALLOWED_ORIGINS=http://localhost:3001
ADMIN_FRONTEND_URL=http://localhost:80

# Frontend API URL
VITE_API_URL=http://localhost:4000
```

## Production Deployment

### 1. Setup Neon Database

1. Create account at [neon.tech](https://neon.tech)
2. Create new project
3. Copy connection string
4. Update `DATABASE_URL` in `.env`

### 2. Configure Environment

```env
DATABASE_URL=postgresql://user:pass@ep-xxx.neon.tech/streamit?sslmode=require
JWT_SECRET=<generate-with-openssl>
NODE_ENV=production
ALLOWED_ORIGINS=https://app.vidrelay.site
ADMIN_FRONTEND_URL=https://app.vidrelay.site
VITE_API_URL=https://api.vidrelay.site
```

### 3. Deploy

```bash
# Build with production config
docker-compose build

# Start services
docker-compose up -d

# Run migrations
docker-compose exec backend bunx prisma migrate deploy

# Seed admin user (first time only)
docker-compose exec backend bun run prisma/seed.ts
```

### 4. Setup Reverse Proxy (Nginx)

For production with domains, use Nginx as reverse proxy:

```nginx
# Frontend (app.vidrelay.site)
server {
    listen 80;
    server_name app.vidrelay.site;
    
    location / {
        proxy_pass http://localhost:80;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}

# Backend (api.vidrelay.site)
server {
    listen 80;
    server_name api.vidrelay.site;
    
    location / {
        proxy_pass http://localhost:4000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

Then setup SSL with Certbot:
```bash
sudo certbot --nginx -d app.vidrelay.site -d api.vidrelay.site
```

## Docker Commands

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
```

### Restart Services

```bash
# Restart all
docker-compose restart

# Restart specific service
docker-compose restart backend
docker-compose restart frontend
```

### Execute Commands

```bash
# Run Prisma Studio
docker-compose exec backend bunx prisma studio

# Access backend shell
docker-compose exec backend sh

# Run migrations
docker-compose exec backend bunx prisma migrate deploy
```

### Update Application

```bash
# Pull latest code
git pull

# Rebuild and restart
docker-compose up -d --build

# Run new migrations
docker-compose exec backend bunx prisma migrate deploy
```

### Clean Up

```bash
# Stop and remove containers
docker-compose down

# Remove volumes (WARNING: deletes data)
docker-compose down -v

# Remove images
docker-compose down --rmi all
```

## Troubleshooting

### Backend won't start

```bash
# Check logs
docker-compose logs backend

# Common issues:
# - DATABASE_URL not set or invalid
# - JWT_SECRET not set
# - Database not accessible
```

### Frontend shows API errors

```bash
# Check if backend is running
curl http://localhost:4000/health

# Verify VITE_API_URL is correct
docker-compose exec frontend cat /usr/share/nginx/html/index.html | grep VITE_API_URL
```

### Database connection failed

```bash
# Test Neon connection
docker-compose exec backend bunx prisma db pull

# Check DATABASE_URL format:
# postgresql://user:pass@host/db?sslmode=require
```

### Port conflicts

```bash
# Change ports in .env
BACKEND_PORT=4001
FRONTEND_PORT=8080

# Restart
docker-compose up -d
```

## Health Checks

Both services have health checks:

```bash
# Check backend health
curl http://localhost:4000/health

# Check frontend health
curl http://localhost/

# View health status
docker-compose ps
```

## Monitoring

### Resource Usage

```bash
# View container stats
docker stats

# View specific container
docker stats streamit-backend streamit-frontend
```

### Logs

```bash
# Follow logs
docker-compose logs -f

# Last 100 lines
docker-compose logs --tail=100

# Since specific time
docker-compose logs --since 30m
```

## Backup

### Database Backup (Neon)

Neon provides automatic backups. To create manual backup:

1. Go to Neon dashboard
2. Select your project
3. Click "Backups"
4. Create backup

### Application Backup

```bash
# Backup environment file
cp .env .env.backup

# Export database schema
docker-compose exec backend bunx prisma db pull
```

## Security

1. **Change default admin password** immediately after first login
2. **Use strong JWT_SECRET** (min 32 characters)
3. **Enable HTTPS** in production
4. **Restrict CORS** to your domain only
5. **Keep Docker images updated**

```bash
# Update images
docker-compose pull
docker-compose up -d
```

## Performance

### Optimize Build

```bash
# Use BuildKit for faster builds
DOCKER_BUILDKIT=1 docker-compose build
```

### Resource Limits

Add to docker-compose.yml:

```yaml
services:
  backend:
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 512M
```

## Next Steps

- Setup monitoring (Prometheus, Grafana)
- Configure log aggregation
- Setup automated backups
- Implement CI/CD pipeline
- Add load balancing for scaling

---

For more details, see the [main documentation](docs/README.md).
