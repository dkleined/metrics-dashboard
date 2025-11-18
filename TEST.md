# Testing Guide

Quick tests to verify the metrics dashboard is working correctly.

## 🧪 Manual Testing

### Test 1: Dashboard Starts

```bash
cd metrics-dashboard
npm install
npm run dev
```

**Expected**: Server starts on `http://localhost:3001`

### Test 2: Dashboard UI Loads

1. Open `http://localhost:3001`
2. Enter secret: `dev-dashboard-view-key-change-in-production`

**Expected**: Dashboard loads with empty metrics

### Test 3: Manual Event Ingestion

Use curl or Postman to send a test event:

```bash
curl -X POST http://localhost:3001/api/ingest \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer dev-metrics-secret-key-change-in-production" \
  -d '{
    "projectId": "test-project",
    "eventType": "page_view",
    "path": "/test",
    "visitorId": "test-visitor-123"
  }'
```

**Expected**: `{"success":true,"message":"Event ingested successfully"}`

### Test 4: View Ingested Event

1. Refresh dashboard at `http://localhost:3001`
2. Look for "test-project" in projects overview

**Expected**: See 1 visitor, 1 page view for test-project

### Test 5: Portfolio Integration

```bash
# Terminal 1: Dashboard
cd metrics-dashboard
npm run dev

# Terminal 2: Portfolio
cd danielklein-portfolio
npm install
npm run dev
```

1. Open `http://localhost:3000` (portfolio)
2. Navigate to different pages
3. Open `http://localhost:3001` (dashboard)
4. Enter secret and select "portfolio" project

**Expected**: See page views incrementing in real-time

### Test 6: Contact Form Event

1. Go to `http://localhost:3000/contact`
2. Fill out and submit contact form
3. Check dashboard for "contact_form_submit" event

**Expected**: Custom event appears in dashboard

## 🔍 Debugging

### Check Database

```bash
cd metrics-dashboard
sqlite3 metrics.db

# View all events
SELECT * FROM events ORDER BY created_at DESC LIMIT 10;

# View page views
SELECT * FROM page_views ORDER BY created_at DESC LIMIT 10;

# View custom events
SELECT * FROM custom_events ORDER BY created_at DESC LIMIT 10;

# Exit
.quit
```

### Check Logs

**Dashboard logs** (Terminal running dashboard):
- Should show ingestion requests
- Any errors will appear here

**Project logs** (Terminal running project):
- Middleware should be silent (fire-and-forget)
- Check for any error messages

### Common Issues

**401 Unauthorized**
- Secret mismatch
- Check `.env.local` files
- Verify Authorization header

**Dashboard shows no data**
- Events may not be sending
- Check browser console for errors
- Verify middleware is configured
- Check that both services are running

**Port conflicts**
- Dashboard: Change port in `package.json`
- Projects: Use `-p` flag: `npm run dev -- -p 3002`

## ✅ Success Criteria

All tests passing means:
- ✅ Dashboard running and accessible
- ✅ Ingestion API accepting events
- ✅ SQLite database storing data
- ✅ Dashboard UI displaying metrics
- ✅ Portfolio integration working
- ✅ Custom events tracking

## 🚀 Next: Integrate Other Projects

Once tests pass, integrate:
1. Ambassador project
2. Plumbing Bid Pro project
3. Add custom events for key actions

See `INTEGRATION_GUIDE.md` for details.
