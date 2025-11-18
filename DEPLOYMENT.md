# Metrics Dashboard Deployment Guide

## Prerequisites
- Vercel account
- PostgreSQL database (Vercel Postgres or Neon recommended)
- Git repository

## Step 1: Prepare for Deployment

### Update Environment Variables
The build script will run migrations automatically. Ensure your database is ready.

### Check package.json
```json
"build": "node -r dotenv/config node_modules/node-pg-migrate/bin/node-pg-migrate up --database-url-var DATABASE_URL dotenv_config_path=.env.local && next build"
```

## Step 2: Deploy to Vercel

### Option A: Via Vercel CLI
```bash
cd metrics-dashboard
vercel
```

### Option B: Via Vercel Dashboard
1. Go to vercel.com/new
2. Import your Git repository
3. Framework Preset: Next.js
4. Root Directory: `metrics-dashboard` (if in monorepo)

## Step 3: Configure Environment Variables

In Vercel Dashboard → Settings → Environment Variables, add:

```bash
# Database (from Vercel Postgres or Neon)
DATABASE_URL=postgresql://user:pass@host:5432/db

# Metrics API Secret (generate a strong random string)
METRICS_SECRET=your-production-secret-key-here
```

**Generate secure secret:**
```bash
openssl rand -hex 32
```

## Step 4: Database Migration

The migrations will run automatically during build. Check the build logs to confirm:
```
✓ Running migrations...
✓ Migration 1732000000000_add-ip-tracking completed
```

If migrations fail, you can run them manually via Vercel CLI:
```bash
vercel env pull .env.local
npm run migrate
```

## Step 4: Update Client Projects

In your portfolio and other projects, update `.env.local`:

```
NEXT_PUBLIC_METRICS_URL=https://your-dashboard.vercel.app
NEXT_PUBLIC_METRICS_SECRET=your-production-secret-key-here
```

## Done!

Your metrics dashboard is now live and tracking analytics from all your projects!

## Git Setup

```bash
cd metrics-dashboard
git init
git add .
git commit -m "Initial commit: Metrics Dashboard"
git remote add origin https://github.com/yourusername/metrics-dashboard.git
git push -u origin main
```
