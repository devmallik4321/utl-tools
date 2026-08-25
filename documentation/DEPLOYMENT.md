# UTL.tools — Production Deployment & Hosting Guide

> **Official production deployment runbook for Vercel, GitHub, and portable Static / VPS architectures.**

---

## 1. Hosting Architecture & Commercial Terms Policy

### Portability First Principle
UTL.tools is engineered as a **100% portable Static-Site Generation (SSG)** web application.
It contains **zero server-locked vendor dependencies** and can be deployed with zero code changes to:
- **Vercel** (Edge Network)
- **Cloudflare Pages**
- **AWS S3 + CloudFront**
- **Docker / Nginx / Node.js VPS** (Ubuntu/Debian)

### ⚠️ Important Vercel Commercial Licensing Directive:
- **Vercel Hobby Plan**: Strictly restricted by Vercel Terms of Service to non-commercial and personal projects.
- **Commercial Deployment**: If UTL.tools is operated commercially (e.g. business sponsorship, corporate utility packs, commercial API integration), it must be deployed on **Vercel Pro / Enterprise** or hosted independently via **Self-Hosted VPS (Nginx/Docker)** or **Cloudflare Pages / AWS**.
- The codebase remains completely agnostic to allow 1-click migration between hosting providers.

---

## 2. GitHub Repository Setup

### .gitignore Verification
Verify that `.gitignore` prevents committing any local environments or temporary artifacts:
- `.next/`
- `node_modules/`
- `.env*.local`
- `control/backups/*.tmp`

### GitHub Remote Repository Linking
```bash
# Initialize git if not already present
git init

# Add all tracked source files
git add .

# Commit baseline
git commit -m "feat: UTL.tools Version 1.1 Production Release (47 Utilities + Control Center)"

# Link to GitHub remote (replace with your organization repository URL)
git branch -M main
git remote add origin https://github.com/<YOUR_ORG>/utl-tools.git
git push -u origin main
```

---

## 3. Vercel Deployment Procedure

### Method A: Vercel CLI (Instant Terminal Deploy)
1. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```
2. Navigate to web-shell application root:
   ```bash
   cd apps/web-shell
   ```
3. Deploy to Preview:
   ```bash
   vercel
   ```
4. Deploy to Production:
   ```bash
   vercel --prod
   ```

### Method B: Vercel Dashboard (Continuous Deployment via Git)
1. Log in to [vercel.com](https://vercel.com).
2. Click **"Add New..."** > **"Project"**.
3. Import your GitHub repository (`utl-tools`).
4. Configure Project Settings:
   - **Framework Preset**: Next.js
   - **Root Directory**: `apps/web-shell`
   - **Build Command**: `npm run build` (or `next build`)
   - **Output Directory**: `.next`
5. Click **"Deploy"**.

---

## 4. Custom Domain & DNS Configuration

To point your custom apex domain `utl.tools` to Vercel:
1. In Vercel Project Dashboard: **Settings > Domains > Add `utl.tools` & `www.utl.tools`**.
2. In your Domain Registrar / DNS Provider (Cloudflare / Namecheap / Route53):
   - **A Record**: `@` points to `76.76.21.21`
   - **CNAME Record**: `www` points to `cname.vercel-dns.com`
3. SSL Certificates are automatically provisioned via Let's Encrypt / DigiCert with zero maintenance.

---

## 5. Rollback & Disaster Recovery Runbook

1. **Instant Vercel Rollback**:
   - In Vercel Dashboard > **Deployments**.
   - Locate the previous known-good deployment.
   - Click the three dots menu `...` > **"Instant Rollback"**. Production traffic immediately switches with 0s downtime.
2. **Control Center State Backup**:
   - Every modification creates a timestamped OpenXML backup in `control/backups/`.
   - In case of operational discrepancy, restore the previous `.xlsx` file from `control/backups/`.

---

## 6. Future VPS / Independent Nginx Migration

If migrating off Vercel to a self-hosted Linux VPS:

```nginx
# /etc/nginx/sites-available/utl.tools
server {
    listen 80;
    listen [::]:80;
    server_name utl.tools www.utl.tools;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name utl.tools www.utl.tools;

    ssl_certificate /etc/letsencrypt/live/utl.tools/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/utl.tools/privkey.pem;

    root /var/www/utl-tools/apps/web-shell/out;
    index index.html;

    location / {
        try_files $uri $uri.html $uri/ /index.html =404;
        add_header Cache-Control "public, max-age=3600, must-revalidate";
    }

    location /_next/static {
        add_header Cache-Control "public, max-age=31536000, immutable";
    }
}
```
