# Frontend Deployment Guide

## Environment Setup

Create `.env` file:

```env
VITE_API_URL=https://api.vidreplay.site
```

## Installation

```bash
cd admin-frontend
bun install
```

## Build

```bash
bun run build
```

This creates a `dist` folder with optimized static files.

## Nginx Configuration

File: `/etc/nginx/sites-available/app.vidreplay.site`

```nginx
server {
    listen 80;
    server_name app.vidreplay.site;
    root /home/ubuntu/streamit-admin/admin-frontend/dist;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/json;

    # SPA fallback
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # No cache for index.html
    location = /index.html {
        add_header Cache-Control "no-cache, no-store, must-revalidate";
        expires 0;
    }
}
```

Enable and reload:
```bash
sudo ln -s /etc/nginx/sites-available/app.vidreplay.site /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## SSL Setup

```bash
sudo certbot --nginx -d app.vidreplay.site
```

## Verify

Visit: `https://app.vidreplay.site`

## Development

```bash
bun dev
```

Runs on `http://localhost:3001`
