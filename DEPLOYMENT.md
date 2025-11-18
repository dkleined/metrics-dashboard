# Metrics Dashboard Deployment Guide

## Prerequisites
- Vercel account
- PostgreSQL database (Vercel Postgres recommended)

## Step 1: Deploy to Vercel

```bash
cd metrics-dashboard
vercel
```

Follow the prompts:
- Link to existing project or create new
- Select "Yes" when asked to add Vercel Postgres

## Step 2: Configure Environment Variables

In Vercel Dashboard, add:

```
METRICS_SECRET=your-production-secret-key-here
POSTGRES_URL=<auto-set by Vercel Postgres>
```

## Step 3: Initialize Database

After deployment, visit:
```
https://your-dashboard.vercel.app/api/init
```

This creates all necessary tables.

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
