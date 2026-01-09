---
description: Deploy application to AWS EC2
---

# Deployment Workflow

Quick reference for deploying the StreamIt Admin Dashboard to AWS EC2.

## Prerequisites

- AWS EC2 instance running (t3.medium recommended)
- Domain configured: app.vidrelay.site, api.vidrelay.site
- SSH access to server

## Initial Setup (One-time)

1. **Connect to server**
   ```bash
   ssh -i ~/.ssh/streamit-admin.pem ubuntu@<EC2-IP>
   ```

2. **Install dependencies** (see DEPLOYMENT.md section "Server Setup & Installation")

3. **Configure database** (see DEPLOYMENT.md section "Database Setup")

4. **Clone repository**
   ```bash
   cd ~
   git clone <repository-url> streamit-admin
   cd streamit-admin
   ```

5. **Setup backend**
   ```bash
   cd admin-backend
   bun install
   # Create .env file (see DEPLOYMENT.md)
   bun db:generate
   bun db:migrate:deploy
   bun db:seed
   ```

6. **Setup frontend**
   ```bash
   cd ../admin-frontend
   bun install
   # Create .env file (see DEPLOYMENT.md)
   bun run build
   ```

7. **Configure Nginx** (see DEPLOYMENT.md section "Nginx Configuration")

8. **Setup SSL** (see DEPLOYMENT.md section "SSL Certificate Setup")

9. **Start with PM2**
   ```bash
   cd ~/streamit-admin
   pm2 start ecosystem.config.js
   pm2 startup systemd
   pm2 save
   ```

## Regular Deployment

// turbo-all

1. **SSH into server**
   ```bash
   ssh -i ~/.ssh/streamit-admin.pem ubuntu@<EC2-IP>
   ```

2. **Run deployment script**
   ```bash
   ~/deploy.sh
   ```

   Or manually:
   ```bash
   cd ~/streamit-admin
   git pull origin main
   cd admin-backend && bun install && bun db:migrate:deploy
   pm2 restart streamit-backend
   cd ../admin-frontend && bun install && bun run build
   sudo systemctl reload nginx
   ```

## Verify Deployment

1. **Check backend**
   ```bash
   curl https://api.vidrelay.site/health
   pm2 logs streamit-backend
   ```

2. **Check frontend**
   ```bash
   curl https://app.vidrelay.site
   ```

3. **Test in browser**
   - Frontend: https://app.vidrelay.site
   - Backend: https://api.vidrelay.site/health

## Troubleshooting

- **Backend not starting**: `pm2 logs streamit-backend --err`
- **Frontend not loading**: `sudo tail -f /var/log/nginx/error.log`
- **Database issues**: `psql -U streamit_admin -d streamit -h localhost`
- **SSL issues**: `sudo certbot certificates`

## Useful Commands

```bash
# View logs
pm2 logs streamit-backend

# Restart backend
pm2 restart streamit-backend

# Check status
pm2 status

# Reload Nginx
sudo systemctl reload nginx

# Backup database
~/backup-db.sh
```

For complete documentation, see `DEPLOYMENT.md`.
