import { NextRequest, NextResponse } from 'next/server';
import { metricsStore, MetricEvent } from '@/lib/metrics';
import { initDatabase } from '@/lib/db';
import { getClientIP, getLocationFromIP } from '@/lib/ipGeolocation';

// Common bot user agents to filter out
const BOT_PATTERNS = [
  /bot/i,
  /crawler/i,
  /spider/i,
  /crawling/i,
  /google/i,
  /bing/i,
  /yahoo/i,
  /baidu/i,
  /yandex/i,
  /duckduckgo/i,
  /slurp/i,
  /teoma/i,
  /ia_archiver/i,
  /facebookexternalhit/i,
  /twitterbot/i,
  /linkedinbot/i,
  /whatsapp/i,
  /slack/i,
  /discord/i,
  /telegram/i,
  /pinterest/i,
  /semrush/i,
  /ahrefs/i,
  /mj12bot/i,
  /dotbot/i,
  /rogerbot/i,
  /screaming frog/i,
  /lighthouse/i,
  /gtmetrix/i,
  /pingdom/i,
  /uptimerobot/i,
];

function isBot(userAgent: string | null | undefined): boolean {
  if (!userAgent) return false;
  return BOT_PATTERNS.some(pattern => pattern.test(userAgent));
}

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// Handle OPTIONS preflight request
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function POST(req: NextRequest) {
    try {
        // Verify secret
        const authHeader = req.headers.get('authorization');
        const secret = authHeader?.replace('Bearer ', '');
        
        if (secret !== process.env.METRICS_SECRET) {
            return NextResponse.json({
                error: 'Unauthorized'
            }, { status: 401, headers: corsHeaders });
        }

        const body = await req.json();
        
        // Check if request is from a bot - reject silently
        if (isBot(body.userAgent)) {
            return NextResponse.json({
                success: true,
                message: 'Event filtered (bot detected)'
            }, { status: 200, headers: corsHeaders });
        }
        
        // Validate required fields
        if (!body.projectId || !body.eventType) {
            return NextResponse.json({
                error: 'Missing required fields: projectId, eventType'
            }, { status: 400, headers: corsHeaders });
        }

        // Validate event type
        if (!['page_view', 'custom_event'].includes(body.eventType)) {
            return NextResponse.json({
                error: 'Invalid eventType. Must be page_view or custom_event'
            }, { status: 400, headers: corsHeaders });
        }

        // Validate page_view has path
        if (body.eventType === 'page_view' && !body.path) {
            return NextResponse.json({
                error: 'page_view events require a path'
            }, { status: 400, headers: corsHeaders });
        }

        // Validate custom_event has eventName
        if (body.eventType === 'custom_event' && !body.eventName) {
            return NextResponse.json({
                error: 'custom_event events require an eventName'
            }, { status: 400, headers: corsHeaders });
        }

        // Get IP and location
        const ip = getClientIP(req);
        const location = await getLocationFromIP(ip);

        const event: MetricEvent = {
            projectId: body.projectId,
            eventType: body.eventType,
            visitorId: body.visitorId,
            path: body.path,
            eventName: body.eventName,
            properties: body.properties,
            referrer: body.referrer,
            userAgent: body.userAgent,
            ipAddress: location.ip,
            city: location.city,
            region: location.region,
            country: location.country
        };

        await metricsStore.ingestEvent(event);

        return NextResponse.json({
            success: true,
            message: 'Event ingested successfully'
        }, { status: 200, headers: corsHeaders });
    } catch (error) {
        console.error('Ingestion error:', error);
        return NextResponse.json({
            error: 'Internal server error',
            message: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500, headers: corsHeaders });
    }
}

// Support batch ingestion
export async function PUT(req: NextRequest) {
    try {
        const authHeader = req.headers.get('authorization');
        const secret = authHeader?.replace('Bearer ', '');
        
        if (secret !== process.env.METRICS_SECRET) {
            return NextResponse.json({
                error: 'Unauthorized'
            }, { status: 401, headers: corsHeaders });
        }

        const body = await req.json();
        
        if (!Array.isArray(body.events)) {
            return NextResponse.json({
                error: 'Batch ingestion requires an events array'
            }, { status: 400, headers: corsHeaders });
        }

        let successCount = 0;
        const errors = [];

        for (const eventData of body.events) {
            try {
                // Skip bot events in batch
                if (isBot(eventData.userAgent)) {
                    successCount++; // Count as success but don't ingest
                    continue;
                }
                
                if (!eventData.projectId || !eventData.eventType) {
                    errors.push({ event: eventData, error: 'Missing required fields' });
                    continue;
                }

                const event: MetricEvent = {
                    projectId: eventData.projectId,
                    eventType: eventData.eventType,
                    visitorId: eventData.visitorId,
                    path: eventData.path,
                    eventName: eventData.eventName,
                    properties: eventData.properties,
                    referrer: eventData.referrer,
                    userAgent: eventData.userAgent
                };

                await metricsStore.ingestEvent(event);
                successCount++;
            } catch (err) {
                errors.push({ 
                    event: eventData, 
                    error: err instanceof Error ? err.message : 'Unknown error' 
                });
            }
        }

        return NextResponse.json({
            success: true,
            message: `Ingested ${successCount} events`,
            successCount,
            errorCount: errors.length,
            errors: errors.length > 0 ? errors : undefined
        }, { status: 200, headers: corsHeaders });
    } catch (error) {
        console.error('Batch ingestion error:', error);
        return NextResponse.json({
            error: 'Internal server error',
            message: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500, headers: corsHeaders });
    }
}
