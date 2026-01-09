# AWS EC2 Deployment Guide for StreamIt Admin Dashboard

Complete guide for deploying the StreamIt Admin Dashboard on AWS EC2 with custom domain configuration and SSL certificates.

## 📋 Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [AWS EC2 Instance Setup](#aws-ec2-instance-setup)
3. [Domain Configuration](#domain-configuration)
4. [Server Setup & Installation](#server-setup--installation)
5. [Application Deployment](#application-deployment)
6. [Nginx Configuration](#nginx-configuration)
7. [SSL Certificate Setup](#ssl-certificate-setup)
8. [Environment Configuration](#environment-configuration)
9. [Database Setup](#database-setup)
10. [Process Management](#process-management)
11. [Monitoring & Maintenance](#monitoring--maintenance)
12. [Troubleshooting](#troubleshooting)

---

## 🏗️ Architecture Overview

### Domain Structure
- **Frontend**: `app.vidreplay.site` - React/Vite admin dashboard
- **Backend API**: `api.vidreplay.site` - Bun/Express REST API
- **Database**: PostgreSQL (running on the same EC2 instance)

### Technology Stack
- **Frontend**: React 19 + Vite + TailwindCSS
- **Backend**: Bun + Express + TypeScript
- **Database**: PostgreSQL 16
- **Web Server**: Nginx (reverse proxy + SSL termination)
- **SSL**: Let's Encrypt (via Certbot)
- **Process Manager**: PM2

---

## 🖥️ AWS EC2 Instance Setup

### Recommended Instance Type

For a production admin dashboard with moderate traffic:

| Component | Minimum | Recommended | High Traffic |
|-----------|---------|-------------|--------------|
| **Instance Type** | t3.small | t3.medium | t3.large |
| **vCPUs** | 2 | 2 | 2 |
| **RAM** | 2 GB | 4 GB | 8 GB |
| **Storage** | 20 GB | 30 GB | 50 GB |
| **Monthly Cost** | ~$15 | ~$30 | ~$60 |

**Recommendation**: Start with **t3.medium** (2 vCPU, 4GB RAM, 30GB storage)

### Step 1: Launch EC2 Instance

1. **Login to AWS Console**
   - Navigate to EC2 Dashboard
   - Click "Launch Instance"

2. **Configure Instance**
   ```
   Name: streamit-admin-server
   AMI: Ubuntu Server 22.04 LTS (64-bit x86)
   Instance Type: t3.medium
   Key Pair: Create new or select existing (.pem file)
   ```

3. **Network Settings**
   - Create security group: `streamit-admin-sg`
   - Configure inbound rules:
   
   | Type | Protocol | Port Range | Source | Description |
   |------|----------|------------|--------|-------------|
   | SSH | TCP | 22 | Your IP | SSH access |
   | HTTP | TCP | 80 | 0.0.0.0/0 | HTTP traffic |
   | HTTPS | TCP | 443 | 0.0.0.0/0 | HTTPS traffic |
   | Custom TCP | TCP | 4000 | 0.0.0.0/0 | Backend API (temporary) |
   | PostgreSQL | TCP | 5432 | sg-xxx (same SG) | Database (internal only) |

4. **Storage Configuration**
   - Root volume: 30 GB gp3 SSD
   - Enable "Delete on Termination"

5. **Launch Instance**
   - Review and launch
   - Download the `.pem` key pair file
   - Save it securely (e.g., `~/.ssh/streamit-admin.pem`)

6. **Set Key Permissions**
   ```bash
   chmod 400 ~/.ssh/streamit-admin.pem
   ```

### Step 2: Allocate Elastic IP (Optional but Recommended)

1. Go to EC2 → Elastic IPs
2. Click "Allocate Elastic IP address"
3. Associate it with your instance
4. Note the Elastic IP address (e.g., `54.123.45.67`)

**Why?** Prevents IP changes on instance restart.

---

## 🌐 Domain Configuration

### DNS Records Setup

Login to your domain registrar (where you purchased `vidreplay.site`) and add these DNS records:

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

### Verify DNS Propagation

Wait 5-10 minutes, then verify:

```bash
# Check app subdomain
dig app.vidreplay.site +short

# Check api subdomain
dig api.vidreplay.site +short

# Both should return your EC2 IP address
```

Or use online tools:
- https://dnschecker.org
- https://www.whatsmydns.net

---

## 🔧 Server Setup & Installation

### Step 1: Connect to EC2 Instance

```bash
ssh -i ~/.ssh/streamit-admin.pem ubuntu@<Your-EC2-IP>
```

### Step 2: Update System

```bash
# Update package lists
sudo apt update && sudo apt upgrade -y

# Install essential tools
sudo apt install -y curl wget git build-essential software-properties-common
```

### Step 3: Install Bun

```bash
# Install Bun (JavaScript runtime)
curl -fsSL https://bun.sh/install | bash

# Add Bun to PATH
echo 'export BUN_INSTALL="$HOME/.bun"' >> ~/.bashrc
echo 'export PATH="$BUN_INSTALL/bin:$PATH"' >> ~/.bashrc
source ~/.bashrc

# Verify installation
bun --version
```

### Step 4: Install Node.js & npm (for PM2)

```bash
# Install Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verify installation
node --version
npm --version
```

### Step 5: Install PostgreSQL

```bash
# Install PostgreSQL 16
sudo sh -c 'echo "deb http://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" > /etc/apt/sources.list.d/pgdg.list'
wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | sudo apt-key add -
sudo apt update
sudo apt install -y postgresql-16 postgresql-contrib-16

# Start PostgreSQL
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Verify installation
sudo systemctl status postgresql
```

### Step 6: Install Nginx

```bash
# Install Nginx
sudo apt install -y nginx

# Start Nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# Verify installation
sudo systemctl status nginx
```

### Step 7: Install PM2 (Process Manager)

```bash
# Install PM2 globally
sudo npm install -g pm2

# Verify installation
pm2 --version
```

### Step 8: Install Certbot (for SSL)

```bash
# Install Certbot and Nginx plugin
sudo apt install -y certbot python3-certbot-nginx

# Verify installation
certbot --version
```

---

## 🗄️ Database Setup

### Step 1: Configure PostgreSQL

```bash
# Switch to postgres user
sudo -u postgres psql

# Inside PostgreSQL prompt, run:
```

```sql
-- Create database
CREATE DATABASE streamit;

-- Create user with password
CREATE USER streamit_admin WITH PASSWORD 'your_secure_password_here';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE streamit TO streamit_admin;

-- Grant schema privileges (PostgreSQL 15+)
\c streamit
GRANT ALL ON SCHEMA public TO streamit_admin;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO streamit_admin;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO streamit_admin;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO streamit_admin;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO streamit_admin;

-- Exit
\q
```

### Step 2: Configure PostgreSQL for Local Connections

```bash
# Edit pg_hba.conf
sudo nano /etc/postgresql/16/main/pg_hba.conf
```

Add this line before other rules:
```
# TYPE  DATABASE        USER            ADDRESS                 METHOD
local   streamit        streamit_admin                          md5
```

Restart PostgreSQL:
```bash
sudo systemctl restart postgresql
```

### Step 3: Test Database Connection

```bash
# Test connection
psql -U streamit_admin -d streamit -h localhost

# If successful, you'll see:
# streamit=>

# Exit with \q
```

---

## 🚀 Application Deployment

### Step 1: Clone Repository

```bash
# Navigate to home directory
cd ~

# Clone your repository
git clone <your-repository-url> streamit-admin
cd streamit-admin

# Or if using GitHub with SSH
git clone git@github.com:yourusername/admin-streamit.git streamit-admin
cd streamit-admin
```

### Step 2: Setup Backend

```bash
cd ~/streamit-admin/admin-backend

# Install dependencies
bun install

# Create .env file
nano .env
```

**Backend `.env` Configuration:**
```env
# Database Configuration
DATABASE_URL="postgresql://streamit_admin:your_secure_password_here@localhost:5432/streamit"

# JWT Configuration
JWT_SECRET="generate-a-secure-random-string-min-32-characters-long"

# Server Configuration
PORT=4000
NODE_ENV=production

# CORS Configuration
ALLOWED_ORIGINS="https://app.vidreplay.site"
ADMIN_FRONTEND_URL="https://app.vidreplay.site"

# Optional: AWS S3 (if needed)
# AWS_ACCESS_KEY_ID=""
# AWS_SECRET_ACCESS_KEY=""
# AWS_REGION="us-east-1"
# S3_BUCKET_NAME=""
```

**Generate JWT Secret:**
```bash
# Generate a secure random string
openssl rand -base64 32
```

**Run Database Migrations:**
```bash
# Generate Prisma client
bun db:generate

# Run migrations
bun db:migrate:deploy

# Seed database (creates admin user)
bun db:seed
```

**Test Backend:**
```bash
# Test run
bun start

# Should see:
# 🚀 Admin backend running on http://localhost:4000
# Press Ctrl+C to stop
```

### Step 3: Setup Frontend

```bash
cd ~/streamit-admin/admin-frontend

# Install dependencies
bun install

# Create .env file
nano .env
```

**Frontend `.env` Configuration:**
```env
# API Configuration
VITE_API_URL=https://api.vidreplay.site
```

**Build Frontend:**
```bash
# Build for production
bun run build

# This creates a 'dist' folder with optimized static files
```

---

## 🔧 Nginx Configuration

### Step 1: Create Nginx Configuration for Backend

```bash
sudo nano /etc/nginx/sites-available/api.vidreplay.site
```

**Backend Nginx Config (`api.vidreplay.site`):**
```nginx
server {
    listen 80;
    server_name api.vidreplay.site;

    # Redirect HTTP to HTTPS (will be enabled after SSL setup)
    # return 301 https://$server_name$request_uri;

    # Proxy to backend
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

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
}
```

### Step 2: Create Nginx Configuration for Frontend

```bash
sudo nano /etc/nginx/sites-available/app.vidreplay.site
```

**Frontend Nginx Config (`app.vidreplay.site`):**
```nginx
server {
    listen 80;
    server_name app.vidreplay.site;

    # Root directory
    root /home/ubuntu/streamit-admin/admin-frontend/dist;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/javascript application/json;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # SPA fallback - serve index.html for all routes
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Disable caching for index.html
    location = /index.html {
        add_header Cache-Control "no-cache, no-store, must-revalidate";
        expires 0;
    }
}
```

### Step 3: Enable Sites

```bash
# Create symbolic links to enable sites
sudo ln -s /etc/nginx/sites-available/api.vidreplay.site /etc/nginx/sites-enabled/
sudo ln -s /etc/nginx/sites-available/app.vidreplay.site /etc/nginx/sites-enabled/

# Remove default site
sudo rm /etc/nginx/sites-enabled/default

# Test Nginx configuration
sudo nginx -t

# Should see:
# nginx: configuration file /etc/nginx/nginx.conf test is successful

# Reload Nginx
sudo systemctl reload nginx
```

### Step 4: Verify HTTP Access

```bash
# Test backend
curl http://api.vidreplay.site/health

# Test frontend
curl http://app.vidreplay.site
```

---

## 🔒 SSL Certificate Setup

### Step 1: Obtain SSL Certificates with Certbot

```bash
# Obtain certificates for both domains
sudo certbot --nginx -d app.vidreplay.site -d api.vidreplay.site

# Follow the prompts:
# 1. Enter email address for urgent renewal notices
# 2. Agree to Terms of Service (Y)
# 3. Share email with EFF (optional - Y/N)
# 4. Choose redirect option: 2 (Redirect HTTP to HTTPS)
```

**What Certbot Does:**
- Obtains SSL certificates from Let's Encrypt
- Automatically modifies Nginx configs to enable HTTPS
- Sets up HTTP to HTTPS redirect
- Configures SSL best practices

### Step 2: Verify SSL Configuration

```bash
# Check certificate status
sudo certbot certificates

# Should show:
# Certificate Name: app.vidreplay.site
#   Domains: app.vidreplay.site api.vidreplay.site
#   Expiry Date: [90 days from now]
```

### Step 3: Test HTTPS Access

```bash
# Test backend
curl https://api.vidreplay.site/health

# Test frontend
curl https://app.vidreplay.site
```

Visit in browser:
- https://app.vidreplay.site
- https://api.vidreplay.site/health

### Step 4: Setup Auto-Renewal

```bash
# Test renewal process (dry run)
sudo certbot renew --dry-run

# Certbot automatically sets up a systemd timer for renewal
# Verify it's active:
sudo systemctl status certbot.timer

# Certificates will auto-renew 30 days before expiry
```

### Step 5: Final Nginx Configuration (After SSL)

After Certbot modifies your configs, they should look like this:

**Backend (`/etc/nginx/sites-available/api.vidreplay.site`):**
```nginx
server {
    server_name api.vidreplay.site;

    # Proxy to backend
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

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    listen 443 ssl; # managed by Certbot
    ssl_certificate /etc/letsencrypt/live/app.vidreplay.site/fullchain.pem; # managed by Certbot
    ssl_certificate_key /etc/letsencrypt/live/app.vidreplay.site/privkey.pem; # managed by Certbot
    include /etc/letsencrypt/options-ssl-nginx.conf; # managed by Certbot
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem; # managed by Certbot
}

server {
    if ($host = api.vidreplay.site) {
        return 301 https://$host$request_uri;
    } # managed by Certbot

    listen 80;
    server_name api.vidreplay.site;
    return 404; # managed by Certbot
}
```

---

## 🔄 Process Management with PM2

### Step 1: Create PM2 Ecosystem File

```bash
cd ~/streamit-admin

# Create PM2 config
nano ecosystem.config.js
```

**PM2 Configuration (`ecosystem.config.js`):**
```javascript
module.exports = {
  apps: [
    {
      name: 'streamit-backend',
      cwd: '/home/ubuntu/streamit-admin/admin-backend',
      script: 'bun',
      args: 'run index.ts',
      interpreter: 'none',
      env: {
        NODE_ENV: 'production',
        PORT: 4000
      },
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      error_file: '/home/ubuntu/logs/backend-error.log',
      out_file: '/home/ubuntu/logs/backend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true
    }
  ]
};
```

### Step 2: Create Logs Directory

```bash
mkdir -p ~/logs
```

### Step 3: Start Application with PM2

```bash
# Start application
pm2 start ecosystem.config.js

# Check status
pm2 status

# View logs
pm2 logs streamit-backend

# Monitor
pm2 monit
```

### Step 4: Setup PM2 Startup Script

```bash
# Generate startup script
pm2 startup systemd

# Copy and run the command it outputs (will look like):
# sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u ubuntu --hp /home/ubuntu

# Save PM2 process list
pm2 save

# Verify startup is configured
sudo systemctl status pm2-ubuntu
```

### Step 5: PM2 Useful Commands

```bash
# View logs
pm2 logs streamit-backend          # All logs
pm2 logs streamit-backend --lines 100  # Last 100 lines
pm2 logs streamit-backend --err    # Only errors

# Restart application
pm2 restart streamit-backend

# Stop application
pm2 stop streamit-backend

# Delete from PM2
pm2 delete streamit-backend

# Monitor resources
pm2 monit

# Show detailed info
pm2 show streamit-backend

# Flush logs
pm2 flush
```

---

## 🔄 Deployment Workflow

### Initial Deployment

```bash
# 1. SSH into server
ssh -i ~/.ssh/streamit-admin.pem ubuntu@<Your-EC2-IP>

# 2. Navigate to project
cd ~/streamit-admin

# 3. Pull latest code
git pull origin main

# 4. Update backend
cd admin-backend
bun install
bun db:migrate:deploy
pm2 restart streamit-backend

# 5. Update frontend
cd ../admin-frontend
bun install
bun run build
sudo systemctl reload nginx
```

### Create Deployment Script

```bash
nano ~/deploy.sh
```

**Deployment Script (`~/deploy.sh`):**
```bash
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
echo "🌐 Frontend: https://app.vidreplay.site"
echo "🔌 Backend: https://api.vidreplay.site"

# Show backend status
pm2 status streamit-backend
```

Make it executable:
```bash
chmod +x ~/deploy.sh
```

Run deployment:
```bash
~/deploy.sh
```

---

## 📊 Monitoring & Maintenance

### System Monitoring

```bash
# Check disk usage
df -h

# Check memory usage
free -h

# Check CPU usage
top

# Check running processes
ps aux | grep bun

# Check Nginx status
sudo systemctl status nginx

# Check PostgreSQL status
sudo systemctl status postgresql

# Check PM2 processes
pm2 status
```

### Application Logs

```bash
# Backend logs (PM2)
pm2 logs streamit-backend

# Nginx access logs
sudo tail -f /var/log/nginx/access.log

# Nginx error logs
sudo tail -f /var/log/nginx/error.log

# PostgreSQL logs
sudo tail -f /var/log/postgresql/postgresql-16-main.log
```

### Database Backup

```bash
# Create backup script
nano ~/backup-db.sh
```

**Backup Script (`~/backup-db.sh`):**
```bash
#!/bin/bash

# Configuration
DB_NAME="streamit"
DB_USER="streamit_admin"
BACKUP_DIR="/home/ubuntu/backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/streamit_backup_$DATE.sql"

# Create backup directory if it doesn't exist
mkdir -p $BACKUP_DIR

# Create backup
echo "Creating backup: $BACKUP_FILE"
PGPASSWORD='your_secure_password_here' pg_dump -U $DB_USER -h localhost $DB_NAME > $BACKUP_FILE

# Compress backup
gzip $BACKUP_FILE

# Delete backups older than 7 days
find $BACKUP_DIR -name "streamit_backup_*.sql.gz" -mtime +7 -delete

echo "Backup complete: ${BACKUP_FILE}.gz"
```

Make it executable:
```bash
chmod +x ~/backup-db.sh
```

**Setup Automated Daily Backups:**
```bash
# Edit crontab
crontab -e

# Add this line (runs daily at 2 AM)
0 2 * * * /home/ubuntu/backup-db.sh >> /home/ubuntu/logs/backup.log 2>&1
```

### SSL Certificate Monitoring

```bash
# Check certificate expiry
sudo certbot certificates

# Test renewal (dry run)
sudo certbot renew --dry-run

# Force renewal (if needed)
sudo certbot renew --force-renewal
```

### Security Updates

```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Update Bun
curl -fsSL https://bun.sh/install | bash

# Update Node.js (if needed)
# Check current version
node --version

# Update to latest LTS
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt install -y nodejs
```

---

## 🐛 Troubleshooting

### Backend Not Starting

```bash
# Check PM2 logs
pm2 logs streamit-backend --err

# Common issues:
# 1. Database connection error
#    - Verify DATABASE_URL in .env
#    - Test: psql -U streamit_admin -d streamit -h localhost

# 2. Port already in use
#    - Check: sudo lsof -i :4000
#    - Kill process: sudo kill -9 <PID>

# 3. Missing dependencies
#    - Reinstall: cd ~/streamit-admin/admin-backend && bun install

# Restart backend
pm2 restart streamit-backend
```

### Frontend Not Loading

```bash
# Check Nginx error logs
sudo tail -f /var/log/nginx/error.log

# Common issues:
# 1. Build files missing
#    - Rebuild: cd ~/streamit-admin/admin-frontend && bun run build

# 2. Nginx config error
#    - Test: sudo nginx -t
#    - Reload: sudo systemctl reload nginx

# 3. Permissions issue
#    - Fix: sudo chown -R ubuntu:ubuntu ~/streamit-admin/admin-frontend/dist
```

### SSL Certificate Issues

```bash
# Check certificate status
sudo certbot certificates

# Renew certificate manually
sudo certbot renew

# If renewal fails, check:
# 1. DNS records are correct
# 2. Ports 80 and 443 are open
# 3. Nginx is running

# Test SSL configuration
curl -vI https://app.vidreplay.site
```

### Database Connection Issues

```bash
# Test database connection
psql -U streamit_admin -d streamit -h localhost

# If connection fails:
# 1. Check PostgreSQL is running
sudo systemctl status postgresql

# 2. Check pg_hba.conf
sudo nano /etc/postgresql/16/main/pg_hba.conf

# 3. Restart PostgreSQL
sudo systemctl restart postgresql

# 4. Check database logs
sudo tail -f /var/log/postgresql/postgresql-16-main.log
```

### High Memory Usage

```bash
# Check memory usage
free -h

# Check which process is using memory
ps aux --sort=-%mem | head

# Restart backend to free memory
pm2 restart streamit-backend

# If PostgreSQL is using too much memory:
sudo systemctl restart postgresql
```

### Nginx 502 Bad Gateway

```bash
# This usually means backend is not running
# Check backend status
pm2 status streamit-backend

# Check if backend is listening on port 4000
sudo lsof -i :4000

# Restart backend
pm2 restart streamit-backend

# Check Nginx error logs
sudo tail -f /var/log/nginx/error.log
```

---

## 🔐 Security Best Practices

### 1. Firewall Configuration

```bash
# Install UFW (Uncomplicated Firewall)
sudo apt install -y ufw

# Allow SSH
sudo ufw allow 22/tcp

# Allow HTTP and HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Enable firewall
sudo ufw enable

# Check status
sudo ufw status
```

### 2. Disable Root Login

```bash
# Edit SSH config
sudo nano /etc/ssh/sshd_config

# Set these values:
PermitRootLogin no
PasswordAuthentication no
PubkeyAuthentication yes

# Restart SSH
sudo systemctl restart sshd
```

### 3. Setup Fail2Ban

```bash
# Install Fail2Ban
sudo apt install -y fail2ban

# Create local config
sudo cp /etc/fail2ban/jail.conf /etc/fail2ban/jail.local

# Edit config
sudo nano /etc/fail2ban/jail.local

# Enable SSH protection (find [sshd] section):
[sshd]
enabled = true
port = 22
maxretry = 3
bantime = 3600

# Start Fail2Ban
sudo systemctl start fail2ban
sudo systemctl enable fail2ban

# Check status
sudo fail2ban-client status
```

### 4. Regular Security Updates

```bash
# Enable automatic security updates
sudo apt install -y unattended-upgrades

# Configure
sudo dpkg-reconfigure -plow unattended-upgrades
```

---

## 📝 Quick Reference

### Essential Commands

```bash
# SSH into server
ssh -i ~/.ssh/streamit-admin.pem ubuntu@<EC2-IP>

# Deploy updates
~/deploy.sh

# Check application status
pm2 status

# View backend logs
pm2 logs streamit-backend

# Restart backend
pm2 restart streamit-backend

# Reload Nginx
sudo systemctl reload nginx

# Check SSL certificates
sudo certbot certificates

# Backup database
~/backup-db.sh
```

### Important File Locations

```
Application:     /home/ubuntu/streamit-admin/
Backend:         /home/ubuntu/streamit-admin/admin-backend/
Frontend:        /home/ubuntu/streamit-admin/admin-frontend/
Frontend Build:  /home/ubuntu/streamit-admin/admin-frontend/dist/
Logs:            /home/ubuntu/logs/
Backups:         /home/ubuntu/backups/
Nginx Config:    /etc/nginx/sites-available/
SSL Certs:       /etc/letsencrypt/live/app.vidreplay.site/
```

### Default Credentials

```
Admin Dashboard:
Email: admin@streamit.com
Password: Admin@123456
(Change immediately after first login!)

Database:
User: streamit_admin
Database: streamit
Password: (set during setup)
```

---

## 🎉 Deployment Checklist

- [ ] EC2 instance launched (t3.medium recommended)
- [ ] Elastic IP allocated and associated
- [ ] Security group configured (ports 22, 80, 443)
- [ ] DNS A records created (app.vidreplay.site, api.vidreplay.site)
- [ ] SSH access verified
- [ ] System updated (`apt update && apt upgrade`)
- [ ] Bun installed
- [ ] Node.js & npm installed
- [ ] PostgreSQL installed and configured
- [ ] Nginx installed
- [ ] PM2 installed
- [ ] Certbot installed
- [ ] Database created and user configured
- [ ] Repository cloned
- [ ] Backend dependencies installed
- [ ] Backend .env configured
- [ ] Database migrations run
- [ ] Database seeded
- [ ] Frontend dependencies installed
- [ ] Frontend .env configured
- [ ] Frontend built
- [ ] Nginx configs created for both domains
- [ ] Nginx configs enabled
- [ ] SSL certificates obtained
- [ ] PM2 ecosystem configured
- [ ] Backend started with PM2
- [ ] PM2 startup script configured
- [ ] Deployment script created
- [ ] Backup script created and scheduled
- [ ] Firewall configured
- [ ] Security hardening applied
- [ ] Application tested (https://app.vidreplay.site)
- [ ] API tested (https://api.vidreplay.site/health)
- [ ] Admin login tested
- [ ] Monitoring setup verified

---

## 📞 Support & Resources

### Documentation
- [Bun Documentation](https://bun.sh/docs)
- [Nginx Documentation](https://nginx.org/en/docs/)
- [Let's Encrypt Documentation](https://letsencrypt.org/docs/)
- [PM2 Documentation](https://pm2.keymetrics.io/docs/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)

### Useful Tools
- [SSL Test](https://www.ssllabs.com/ssltest/)
- [DNS Checker](https://dnschecker.org)
- [HTTP Status Checker](https://httpstatus.io)

---

**Last Updated**: January 2026  
**Version**: 1.0.0
