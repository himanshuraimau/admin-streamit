# AWS EC2 Deployment Guide

Complete guide for deploying StreamIt Admin Dashboard on AWS EC2 with Neon PostgreSQL.

**Deployment Setup:**
- Frontend: `app.vidrelay.site`
- Backend: `api.vidrelay.site`
- Database: Neon PostgreSQL (cloud)
- Server: Single AWS EC2 instance

---

## 📋 Prerequisites

- AWS Account
- Domain: `vidrelay.site` (with DNS access)
- Neon account (free tier available)
- SSH key pair for EC2

---

## Part 1: Setup Neon Database

### 1. Create Neon Account

1. Go to [neon.tech](https://neon.tech)
2. Sign up (free tier available)
3. Create new project: `streamit-admin`

### 2. Get Database Connection String

1. In Neon dashboard, go to your project
2. Click "Connection Details"
3. Copy the connection string (looks like):
   ```
   postgresql://user:password@ep-xxx-xxx.us-east-2.aws.neon.tech/streamit?sslmode=require
   ```
4. Save this for later - you'll need it in `.env`

### 3. Note Database Details

Keep these handy:
- Database URL
- Database name (usually `streamit` or `neondb`)
- Region (e.g., `us-east-2`)

---

## Part 2: Setup AWS EC2 Instance

### 1. Launch EC2 Instance

**Instance Configuration:**
- **AMI**: Ubuntu Server 22.04 LTS (64-bit x86)
- **Instance Type**: t3.small (minimum) or t3.medium (recommended)
  - t3.small: 2 vCPU, 2GB RAM (~$15/month)
  - t3.medium: 2 vCPU, 4GB RAM (~$30/month)
- **Storage**: 20-30 GB gp3 SSD

**Steps:**
1. Go to AWS Console → EC2 → Launch Instance
2. Name: `streamit-admin-server`
3. Select Ubuntu 22.04 LTS
4. Choose instance type (t3.medium recommended)
5. Create or select key pair (download `.pem` file)
6. Configure storage: 30 GB

### 2. Configure Security Group

Create security group: `streamit-admin-sg`

**Inbound Rules:**

| Type | Protocol | Port | Source | Description |
|------|----------|------|--------|-------------|
| SSH | TCP | 22 | Your IP | SSH access |
| HTTP | TCP | 80 | 0.0.0.0/0 | HTTP traffic |
| HTTPS | TCP | 443 | 0.0.0.0/0 | HTTPS traffic |

**Important:** Don't expose ports 4000 or 5432 publicly!

### 3. Allocate Elastic IP

1. Go to EC2 → Elastic IPs
2. Click "Allocate Elastic IP address"
3. Associate it with your instance
4. Note the IP address (e.g., `54.123.45.67`)

**Why?** Prevents IP changes on instance restart.

---

## Part 3: Configure DNS

### 1. Add DNS Records

In your domain registrar (where you bought `vidrelay.site`), add these A records:

| Type | Name | Value | TTL |
|------|------|-------|-----|
| A | app | `<Your-EC2-Elastic-IP>` | 300 |
| A | api | `<Your-EC2-Elastic-IP>` | 300 |

**Example:**
```
Type: A
Name: app
Value: 54.123.45.67
TTL: 300

Type: A
Name: api
Value: 54.123.45.67
TTL: 300
```

### 2. Verify DNS Propagation

Wait 5-10 minutes, then verify:

```bash
dig app.vidrelay.site +short
dig api.vidrelay.site +short
# Both should return your EC2 IP
```

Or use: https://dnschecker.org

---

## Part 4: Server Setup

### 1. Connect to EC2

```bash
# Set key permissions
chmod 400 ~/.ssh/your-key.pem

# SSH into server
ssh -i ~/.ssh/your-key.pem ubuntu@<Your-EC2-IP>
```

### 2. Update System

```bash
# Update packages
sudo apt update && sudo apt upgrade -y

# Install essential tools
sudo apt install -y curl wget git unzip
```

### 3. Install Docker & Docker Compose

```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add user to docker group
sudo usermod -aG docker ubuntu

# Log out and back in for group changes
exit
# SSH back in
ssh -i ~/.ssh/your-key.pem ubuntu@<Your-EC2-IP>

# Verify Docker
docker --version

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Verify
docker-compose --version
```

### 4. Install Nginx

```bash
# Install Nginx
sudo apt install -y nginx

# Start and enable
sudo systemctl start nginx
sudo systemctl enable nginx

# Verify
sudo systemctl status nginx
```

### 5. Install Certbot (for SSL)

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Verify
certbot --version
```

---

## Part 5: Deploy Application

### 1. Clone Repository

```bash
# Navigate to home
cd ~

# Clone your repository
git clone <your-repo-url> streamit-admin
cd streamit-admin

# Or if using GitHub with SSH
git clone git@github.com:yourusername/admin-streamit.git streamit-admin
cd streamit-admin
```

### 2. Configure Environment

```bash
# Copy environment template
cp .env.example .env

# Edit environment file
nano .env
```

**Update `.env` with:**

```env
# Database (from Neon)
DATABASE_URL=postgresql://user:password@ep-xxx.neon.tech/streamit?sslmode=require

# JWT Secret (generate new one)
JWT_SECRET=<generate-with-command-below>

# Server
NODE_ENV=production
BACKEND_PORT=4000
FRONTEND_PORT=3000

# CORS
ALLOWED_ORIGINS=https://app.vidrelay.site
ADMIN_FRONTEND_URL=https://app.vidrelay.site

# Frontend API URL
VITE_API_URL=https://api.vidrelay.site
```

**Generate JWT Secret:**
```bash
openssl rand -base64 32
```

### 3. Build and Start Containers

```bash
# Build images
docker-compose build

# Start services
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f
```

### 4. Run Database Migrations

```bash
# Run migrations
docker-compose exec backend bunx prisma migrate deploy

# Seed admin user
docker-compose exec backend bun run prisma/seed.ts
```

### 5. Verify Services

```bash
# Check backend
curl http://localhost:4000/health

# Check frontend
curl http://localhost:3000
```

---

## Part 6: Configure Nginx Reverse Proxy

### 1. Create Backend Config

```bash
sudo nano /etc/nginx/sites-available/api.vidrelay.site
```

**Add:**
```nginx
server {
    listen 80;
    server_name api.vidrelay.site;

    location / {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
}
```

### 2. Create Frontend Config

```bash
sudo nano /etc/nginx/sites-available/app.vidrelay.site
```

**Add:**
```nginx
server {
    listen 80;
    server_name app.vidrelay.site;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 3. Enable Sites

```bash
# Create symbolic links
sudo ln -s /etc/nginx/sites-available/api.vidrelay.site /etc/nginx/sites-enabled/
sudo ln -s /etc/nginx/sites-available/app.vidrelay.site /etc/nginx/sites-enabled/

# Remove default site
sudo rm /etc/nginx/sites-enabled/default

# Test configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

### 4. Test HTTP Access

```bash
# Test backend
curl http://api.vidrelay.site/health

# Test frontend
curl http://app.vidrelay.site
```

Visit in browser:
- http://app.vidrelay.site
- http://api.vidrelay.site/health

---

## Part 7: Setup SSL Certificates

### 1. Obtain SSL Certificates

```bash
# Get certificates for both domains
sudo certbot --nginx -d app.vidrelay.site -d api.vidrelay.site
```

**Follow prompts:**
1. Enter email for urgent renewal notices
2. Agree to Terms of Service (Y)
3. Share email with EFF (optional - Y/N)
4. Choose redirect option: **2** (Redirect HTTP to HTTPS)

### 2. Verify SSL

```bash
# Check certificate status
sudo certbot certificates

# Test HTTPS
curl https://api.vidrelay.site/health
curl https://app.vidrelay.site
```

Visit in browser:
- https://app.vidrelay.site
- https://api.vidrelay.site/health

### 3. Auto-Renewal

Certbot automatically sets up renewal. Verify:

```bash
# Test renewal
sudo certbot renew --dry-run

# Check renewal timer
sudo systemctl status certbot.timer
```

Certificates auto-renew 30 days before expiry.

---

## Part 8: Verify Deployment

### 1. Access Application

Visit: **https://app.vidrelay.site**

**Login with:**
- Email: `admin@streamit.com`
- Password: `Admin@123456`

**⚠️ Change password immediately after first login!**

### 2. Test Backend API

```bash
curl https://api.vidrelay.site/health
```

Should return:
```json
{
  "success": true,
  "service": "admin-backend",
  "timestamp": "...",
  "uptime": ...
}
```

### 3. Check All Services

```bash
# Docker containers
docker-compose ps

# Nginx status
sudo systemctl status nginx

# View logs
docker-compose logs -f
```

---

## Part 9: Post-Deployment

### 1. Security Hardening

**Setup Firewall:**
```bash
# Install UFW
sudo apt install -y ufw

# Allow SSH, HTTP, HTTPS
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Enable firewall
sudo ufw enable

# Check status
sudo ufw status
```

**Disable Root Login:**
```bash
sudo nano /etc/ssh/sshd_config

# Set these values:
PermitRootLogin no
PasswordAuthentication no

# Restart SSH
sudo systemctl restart sshd
```

### 2. Setup Monitoring

**View Logs:**
```bash
# Application logs
docker-compose logs -f

# Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

**Monitor Resources:**
```bash
# Container stats
docker stats

# System resources
htop  # Install with: sudo apt install htop
```

### 3. Backup Strategy

**Database Backups:**
- Neon provides automatic backups
- Create manual backups in Neon dashboard

**Application Backups:**
```bash
# Backup .env file
cp .env .env.backup

# Backup Nginx configs
sudo cp -r /etc/nginx/sites-available /etc/nginx/sites-available.backup
```

---

## Deployment Updates

### Update Application

```bash
# SSH into server
ssh -i ~/.ssh/your-key.pem ubuntu@<EC2-IP>

# Navigate to project
cd ~/streamit-admin

# Pull latest code
git pull origin main

# Rebuild and restart
docker-compose up -d --build

# Run new migrations (if any)
docker-compose exec backend bunx prisma migrate deploy

# Check logs
docker-compose logs -f
```

### Rollback

```bash
# Stop containers
docker-compose down

# Checkout previous version
git checkout <previous-commit-hash>

# Rebuild and start
docker-compose up -d --build
```

---

## Troubleshooting

### Backend Not Starting

```bash
# Check logs
docker-compose logs backend

# Common issues:
# 1. DATABASE_URL incorrect
# 2. JWT_SECRET not set
# 3. Neon database not accessible

# Test database connection
docker-compose exec backend bunx prisma db pull
```

### Frontend Shows API Errors

```bash
# Check VITE_API_URL in .env
cat .env | grep VITE_API_URL

# Should be: https://api.vidrelay.site

# Rebuild frontend
docker-compose up -d --build frontend
```

### SSL Certificate Issues

```bash
# Check certificates
sudo certbot certificates

# Renew manually
sudo certbot renew

# Check Nginx config
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

### Domain Not Resolving

```bash
# Check DNS
dig app.vidrelay.site +short
dig api.vidrelay.site +short

# Should return your EC2 IP

# If not, check DNS settings in your domain registrar
```

### Port Conflicts

```bash
# Check what's using ports
sudo lsof -i :80
sudo lsof -i :443
sudo lsof -i :4000
sudo lsof -i :3000

# Stop conflicting services
sudo systemctl stop <service-name>
```

---

## Useful Commands

### Docker

```bash
# View logs
docker-compose logs -f
docker-compose logs -f backend
docker-compose logs -f frontend

# Restart services
docker-compose restart
docker-compose restart backend

# Stop all
docker-compose down

# Start all
docker-compose up -d

# Rebuild
docker-compose up -d --build

# Execute commands
docker-compose exec backend sh
docker-compose exec backend bunx prisma studio
```

### Nginx

```bash
# Test config
sudo nginx -t

# Reload
sudo systemctl reload nginx

# Restart
sudo systemctl restart nginx

# View logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### System

```bash
# Check disk space
df -h

# Check memory
free -h

# Check processes
htop

# Check network
netstat -tulpn
```

---

## Cost Estimate

**Monthly Costs:**
- EC2 t3.medium: ~$30/month
- Elastic IP: Free (while attached)
- Neon Database: Free tier (or ~$20/month for paid)
- Data Transfer: ~$5-10/month

**Total: ~$35-70/month**

---

## Next Steps

1. ✅ Change default admin password
2. ✅ Setup regular backups
3. ✅ Configure monitoring/alerts
4. ✅ Setup automated deployments (CI/CD)
5. ✅ Add more admin users
6. ✅ Configure email notifications (optional)

---

## Support

For issues:
1. Check logs: `docker-compose logs -f`
2. Verify environment: `cat .env`
3. Test database: `docker-compose exec backend bunx prisma db pull`
4. Check DNS: `dig app.vidrelay.site +short`
5. Review [Documentation](docs/README.md)

---

**Deployment Complete! 🎉**

Your admin dashboard is now live at:
- **Frontend**: https://app.vidrelay.site
- **Backend**: https://api.vidrelay.site
