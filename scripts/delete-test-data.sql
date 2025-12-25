-- Delete test data inserted for development
-- Run this on your production database to clean up dummy data

-- Delete page views with test IP addresses or from before your actual launch
DELETE FROM page_views 
WHERE ip_address IN (
    '192.168.1.1',
    '10.0.0.1',
    '172.16.0.1',
    '203.0.113.1',
    '198.51.100.1',
    '192.0.2.1'
)
OR created_at < '2025-11-18'::timestamp; -- Adjust this date to your actual launch date

-- Or if you want to delete ALL data and start fresh:
-- TRUNCATE TABLE page_views CASCADE;
-- TRUNCATE TABLE custom_events CASCADE;
-- TRUNCATE TABLE events CASCADE;

-- Verify what's left
SELECT COUNT(*) as remaining_page_views FROM page_views;
SELECT COUNT(*) as remaining_custom_events FROM custom_events;
SELECT COUNT(*) as remaining_events FROM events;
