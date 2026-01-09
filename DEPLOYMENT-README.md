# AWS EC2 Deployment Files

This directory contains all the necessary configuration files and scripts for deploying the StreamIt Admin Dashboard to AWS EC2.

## 📁 Files Overview

### Documentation
- **`DEPLOYMENT.md`** - Complete deployment guide with step-by-step instructions

### Scripts
- **`setup-ec2.sh`** - Initial server setup script (installs all dependencies)
- **`deploy-ec2.sh`** - Deployment script for updating the application
- **`backup-db.sh`** - Database backup script

### Configuration Files
- **`ecosystem.config.js`** - PM2 process manager configuration
- **`nginx-configs/`** - Nginx configuration templates
  - `api.vidreplay.site.conf` - Backend API configuration
  - `app.vidreplay.site.conf` - Frontend app configuration
- **`env-templates/`** - Environment variable templates
  - `backend.env.template` - Backend environment variables
  - `frontend.env.template` - Frontend environment variables

## 🚀 Quick Start

### 1. Launch EC2 Instance
- Instance type: **t3.medium** (2 vCPU, 4GB RAM)
- AMI: **Ubuntu Server 22.04 LTS**
- Storage: **30GB gp3 SSD**
- Security group: Allow ports 22, 80, 443

### 2. Configure DNS
Add these A records to your domain:
```
app.vidreplay.site → <Your-EC2-IP>
api.vidreplay.site → <Your-EC2-IP>
```

### 3. Run Setup Script
```bash
# SSH into your EC2 instance
ssh -i ~/.ssh/your-key.pem ubuntu@<EC2-IP>

# Clone repository
git clone <your-repo-url> streamit-admin
cd streamit-admin

# Make setup script executable
chmod +x setup-ec2.sh

# Run setup script
./setup-ec2.sh
```

### 4. Configure Database
```bash
sudo -u postgres psql

# In PostgreSQL prompt:
CREATE DATABASE streamit;
CREATE USER streamit_admin WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE streamit TO streamit_admin;
\c streamit
GRANT ALL ON SCHEMA public TO streamit_admin;
\q
```

### 5. Setup Application

**Backend:**
```bash
cd ~/streamit-admin/admin-backend
bun install

# Copy and edit environment file
cp ../env-templates/backend.env.template .env
nano .env  # Update with your values

# Run migrations
bun db:generate
bun db:migrate:deploy
bun db:seed
```

**Frontend:**
```bash
cd ~/streamit-admin/admin-frontend
bun install

# Copy and edit environment file
cp ../env-templates/frontend.env.template .env
nano .env  # Update with your values

# Build
bun run build
```

### 6. Configure Nginx
```bash
# Copy Nginx configs
sudo cp ~/streamit-admin/nginx-configs/api.vidreplay.site.conf /etc/nginx/sites-available/
sudo cp ~/streamit-admin/nginx-configs/app.vidreplay.site.conf /etc/nginx/sites-available/

# Enable sites
sudo ln -s /etc/nginx/sites-available/api.vidreplay.site.conf /etc/nginx/sites-enabled/
sudo ln -s /etc/nginx/sites-available/app.vidreplay.site.conf /etc/nginx/sites-enabled/

# Remove default
sudo rm /etc/nginx/sites-enabled/default

# Test and reload
sudo nginx -t
sudo systemctl reload nginx
```

### 7. Setup SSL
```bash
sudo certbot --nginx -d app.vidreplay.site -d api.vidreplay.site
```

### 8. Start Application
```bash
cd ~/streamit-admin

# Make scripts executable
chmod +x deploy-ec2.sh backup-db.sh

# Start with PM2
pm2 start ecosystem.config.js
pm2 startup systemd
# Run the command it outputs
pm2 save
```

### 9. Setup Database Backups
```bash
# Edit backup script with your database password
nano ~/streamit-admin/backup-db.sh

# Make executable
chmod +x ~/streamit-admin/backup-db.sh

# Add to crontab for daily backups at 2 AM
crontab -e
# Add: 0 2 * * * /home/ubuntu/streamit-admin/backup-db.sh >> /home/ubuntu/logs/backup.log 2>&1
```

## 🔄 Deploying Updates

After initial setup, use the deployment script:

```bash
cd ~/streamit-admin
./deploy-ec2.sh
```

Or use the workflow:
```bash
# From your local machine
ssh -i ~/.ssh/your-key.pem ubuntu@<EC2-IP> "cd ~/streamit-admin && ./deploy-ec2.sh"
```

## 🔍 Monitoring

```bash
# Check backend status
pm2 status

# View logs
pm2 logs streamit-backend

# Monitor resources
pm2 monit

# Check Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

## 🐛 Troubleshooting

### Backend not starting
```bash
pm2 logs streamit-backend --err
```

### Frontend not loading
```bash
sudo tail -f /var/log/nginx/error.log
```

### Database connection issues
```bash
psql -U streamit_admin -d streamit -h localhost
```

### SSL certificate issues
```bash
sudo certbot certificates
sudo certbot renew --dry-run
```

## 📚 Documentation

For complete documentation, see **`DEPLOYMENT.md`**.

## 🔐 Security Checklist

- [ ] Strong database password set
- [ ] JWT secret generated (min 32 characters)
- [ ] Firewall configured (UFW)
- [ ] SSH key-based authentication only
- [ ] Root login disabled
- [ ] SSL certificates installed
- [ ] Regular backups scheduled
- [ ] Security updates enabled

## 🌐 URLs

After deployment:
- **Frontend**: https://app.vidreplay.site
- **Backend**: https://api.vidreplay.site
- **Health Check**: https://api.vidreplay.site/health

## 📞 Support

For issues or questions, refer to the troubleshooting section in `DEPLOYMENT.md`.
