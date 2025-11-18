# Metrics Dashboard

Centralized metrics dashboard for all projects in the monorepo. Projects push their metrics here for unified analytics.

## ⚠️ Important: Environment Setup

**Before running, you MUST configure your database connection:**

1. Copy `.env.local.example` to `.env.local`
2. Update `POSTGRES_URL` with your database credentials
3. Never commit `.env.local` (already in `.gitignore`)

```bash
cp .env.local.example .env.local
# Edit .env.local with your credentials
```

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd metrics-dashboard
npm install
```

### 2. Configure Environment

Create `.env.local`:

```env
METRICS_SECRET=your-secret-key-for-ingestion
DASHBOARD_SECRET=your-secret-key-for-viewing
```

### 3. Run Dashboard

```bash
npm run dev
```

Dashboard will be available at `http://localhost:3001`

## 📊 Features

- **Multi-project support**: Track metrics from all your projects in one place
- **Real-time ingestion**: Projects push events as they happen
- **Beautiful UI**: Modern, responsive dashboard with charts
- **Project filtering**: View metrics for individual projects or all combined
- **Time series**: Track trends over 7, 14, or 30 days
- **Top pages**: See which pages get the most traffic
- **Custom events**: Track any custom events you define

## 🔌 API Endpoints

### POST `/api/ingest`

Ingest a single metric event.

**Headers:**
- `Authorization: Bearer YOUR_METRICS_SECRET`

**Body:**
```json
{
  "projectId": "ambassador",
  "eventType": "page_view",
  "path": "/tattoos",
  "visitorId": "visitor_123",
  "referrer": "https://google.com",
  "userAgent": "Mozilla/5.0..."
}
```

### PUT `/api/ingest`

Batch ingest multiple events.

**Headers:**
- `Authorization: Bearer YOUR_METRICS_SECRET`

**Body:**
```json
{
  "events": [
    {
      "projectId": "ambassador",
      "eventType": "page_view",
      "path": "/home"
    },
    {
      "projectId": "portfolio",
      "eventType": "custom_event",
      "eventName": "button_click",
      "properties": { "buttonId": "contact" }
    }
  ]
}
```

### GET `/api/metrics`

Query aggregated metrics.

**Query Params:**
- `secret`: Dashboard secret (required)
- `projectId`: Filter by project (optional)
- `days`: Number of days to query (default: 7)

**Response:**
```json
{
  "today": {
    "uniqueVisitors": 42,
    "totalPageViews": 156,
    "customEvents": [...],
    "topPages": [...]
  },
  "timeSeries": [...],
  "projects": [...]
}
```

## 🔧 Integration

See `/shared/metrics-client/README.md` for client library documentation.

### Quick Example

```typescript
import { MetricsClient } from '@/shared/metrics-client';

const metrics = new MetricsClient({
  projectId: 'my-project',
  dashboardUrl: 'http://localhost:3001',
  secret: process.env.METRICS_SECRET!
});

metrics.trackPageView({ path: '/home' });
metrics.trackEvent({ 
  eventName: 'form_submit', 
  properties: { formType: 'contact' } 
});
```

## 📁 Database

Uses SQLite (`metrics.db`) with three tables:
- `events`: Generic event log
- `page_views`: Page view tracking
- `custom_events`: Custom event tracking

All tables are indexed for fast queries.

## 🎨 UI Access

Navigate to `http://localhost:3001` and enter your `DASHBOARD_SECRET` to view metrics.

## 🔒 Security

- Ingestion API requires `METRICS_SECRET` in Authorization header
- Dashboard UI requires `DASHBOARD_SECRET` query param
- All secrets should be kept in `.env.local` (not committed to git)

## 📦 Production Deployment

1. Set environment variables on your hosting platform
2. Build: `npm run build`
3. Start: `npm start`
4. Ensure port 3001 is accessible to your projects for ingestion
