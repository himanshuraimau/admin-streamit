# Deployment Checklist

Quick checklist for deploying to AWS EC2.

## ☁️ Pre-Deployment

- [ ] Neon account created
- [ ] Neon database created
- [ ] Database connection string saved
- [ ] AWS account ready
- [ ] Domain purchased (`vidreplay.site`)
- [ ] SSH key pair generated

## 🖥️ AWS Setup

- [ ] EC2 instance launched (t3.medium)
- [ ] Security group configured (ports 22, 80, 443)
- [ ] Elastic IP allocated and associated
- [ ] DNS A records added:
  - [ ] `app.vidreplay.site` → EC2 IP
  - [ ] `api.vidreplay.site` → EC2 IP
- [ ] DNS propagation verified

## 🔧 Server Setup

- [ ] SSH access verified
- [ ] System updated
- [ ] Docker installed
- [ ] Docker Compose installed
- [ ] Nginx installed
- [ ] Certbot installed

## 📦 Application Deployment

- [ ] Repository cloned
- [ ] `.env` file configured:
  - [ ] `DATABASE_URL` (from Neon)
  - [ ] `JWT_SECRET` (generated)
  - [ ] `ALLOWED_ORIGINS` set
  - [ ] `VITE_API_URL` set
- [ ] Docker images built
- [ ] Containers started
- [ ] Database migrations run
- [ ] Admin user seeded

## 🌐 Nginx Configuration

- [ ] Backend config created (`api.vidreplay.site`)
- [ ] Frontend config created (`app.vidreplay.site`)
- [ ] Sites enabled
- [ ] Default site removed
- [ ] Nginx config tested
- [ ] Nginx reloaded
- [ ] HTTP access verified

## 🔒 SSL Setup

- [ ] SSL certificates obtained (Certbot)
- [ ] HTTPS access verified
- [ ] Auto-renewal tested
- [ ] HTTP → HTTPS redirect working

## ✅ Verification

- [ ] Frontend accessible: https://app.vidreplay.site
- [ ] Backend accessible: https://api.vidreplay.site/health
- [ ] Admin login working
- [ ] Default password changed
- [ ] All features tested

## 🔐 Security

- [ ] UFW firewall enabled
- [ ] Root login disabled
- [ ] Password authentication disabled
- [ ] Only necessary ports open

## 📊 Post-Deployment

- [ ] Monitoring setup
- [ ] Backup strategy configured
- [ ] Update procedure documented
- [ ] Team access configured

---

**See [DEPLOY.md](DEPLOY.md) for detailed instructions.**
