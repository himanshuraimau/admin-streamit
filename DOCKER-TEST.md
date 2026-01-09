# Local Docker Testing Guide

Quick guide to test Docker images locally before deploying.

## ✅ Build Status

Docker images built successfully:
- **Backend**: `admin-streamit_backend:latest` (727MB)
- **Frontend**: `admin-streamit_frontend:latest` (54.8MB)

## 🚀 Next Steps

### 1. Update .env with Neon Database

Before starting, update `.env` with your actual Neon database URL:

```bash
nano .env
```

Update this line:
```env
DATABASE_URL=postgresql://your-user:your-password@ep-xxx.us-east-2.aws.neon.tech/streamit?sslmode=require
```

### 2. Start Containers

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f
```

### 3. Run Database Migrations

```bash
# Run migrations
docker-compose exec backend bunx prisma migrate deploy

# Seed admin user
docker-compose exec backend bun run prisma/seed.ts
```

### 4. Access Application

- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:4000
- **Health Check**: http://localhost:4000/health

**Default Login:**
- Email: `admin@streamit.com`
- Password: `Admin@123456`

## 🔍 Useful Commands

### View Logs

```bash
# All services
docker-compose logs -f

# Backend only
docker-compose logs -f backend

# Frontend only
docker-compose logs -f frontend
```

### Restart Services

```bash
# Restart all
docker-compose restart

# Restart backend
docker-compose restart backend

# Restart frontend
docker-compose restart frontend
```

### Stop Services

```bash
# Stop all
docker-compose down

# Stop and remove volumes
docker-compose down -v
```

### Execute Commands in Containers

```bash
# Backend shell
docker-compose exec backend sh

# Run Prisma Studio
docker-compose exec backend bunx prisma studio

# View backend environment
docker-compose exec backend env
```

### Check Container Status

```bash
# List running containers
docker-compose ps

# View container stats
docker stats
```

## 🐛 Troubleshooting

### Backend won't start

```bash
# Check logs
docker-compose logs backend

# Common issues:
# 1. DATABASE_URL not set correctly
# 2. Neon database not accessible
# 3. JWT_SECRET not set
```

### Frontend shows connection error

```bash
# Check if backend is running
curl http://localhost:4000/health

# Check VITE_API_URL in .env
cat .env | grep VITE_API_URL
```

### Database connection failed

```bash
# Test connection from backend container
docker-compose exec backend bunx prisma db pull
```

## 📦 Rebuild Images

If you make changes to code:

```bash
# Rebuild all
docker-compose build

# Rebuild specific service
docker-compose build backend
docker-compose build frontend

# Rebuild and restart
docker-compose up -d --build
```

## 🧹 Clean Up

```bash
# Stop and remove containers
docker-compose down

# Remove images
docker rmi admin-streamit_backend admin-streamit_frontend

# Remove all unused Docker resources
docker system prune -a
```

## ✅ Ready for Production?

Once local testing is successful:

1. ✅ Both images build without errors
2. ✅ Backend starts and connects to Neon
3. ✅ Frontend loads and connects to backend
4. ✅ Can login with admin credentials
5. ✅ All features work correctly

**Next:** Follow [DEPLOY.md](DEPLOY.md) for AWS EC2 deployment.

## 📝 Notes

- The `.env` file is gitignored for security
- JWT secret is already generated: `+sflxjZqbPiSaXeWaz7ON9t9I6o6K7bxfigxWkdBR+w=`
- Make sure to use your actual Neon DATABASE_URL
- For production, update CORS and API URLs in `.env`
