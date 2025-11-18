import { NextRequest, NextResponse } from 'next/server';
import { metricsStore, MetricEvent } from '@/lib/metrics';
import { initDatabase } from '@/lib/db';

export async function POST(req: NextRequest) {
    try {
        // Verify secret
        const authHeader = req.headers.get('authorization');
        const secret = authHeader?.replace('Bearer ', '');
        
        if (secret !== process.env.METRICS_SECRET) {
            return NextResponse.json({
                error: 'Unauthorized'
            }, { status: 401 });
        }

        const body = await req.json();
        
        // Validate required fields
        if (!body.projectId || !body.eventType) {
            return NextResponse.json({
                error: 'Missing required fields: projectId, eventType'
            }, { status: 400 });
        }

        // Validate event type
        if (!['page_view', 'custom_event'].includes(body.eventType)) {
            return NextResponse.json({
                error: 'Invalid eventType. Must be page_view or custom_event'
            }, { status: 400 });
        }

        // Validate page_view has path
        if (body.eventType === 'page_view' && !body.path) {
            return NextResponse.json({
                error: 'page_view events require a path'
            }, { status: 400 });
        }

        // Validate custom_event has eventName
        if (body.eventType === 'custom_event' && !body.eventName) {
            return NextResponse.json({
                error: 'custom_event events require an eventName'
            }, { status: 400 });
        }

        const event: MetricEvent = {
            projectId: body.projectId,
            eventType: body.eventType,
            visitorId: body.visitorId,
            path: body.path,
            eventName: body.eventName,
            properties: body.properties,
            referrer: body.referrer,
            userAgent: body.userAgent
        };

        await metricsStore.ingestEvent(event);

        return NextResponse.json({
            success: true,
            message: 'Event ingested successfully'
        }, { status: 200 });
    } catch (error) {
        console.error('Ingestion error:', error);
        return NextResponse.json({
            error: 'Internal server error',
            message: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
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
            }, { status: 401 });
        }

        const body = await req.json();
        
        if (!Array.isArray(body.events)) {
            return NextResponse.json({
                error: 'Batch ingestion requires an events array'
            }, { status: 400 });
        }

        let successCount = 0;
        const errors = [];

        for (const eventData of body.events) {
            try {
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
        }, { status: 200 });
    } catch (error) {
        console.error('Batch ingestion error:', error);
        return NextResponse.json({
            error: 'Internal server error',
            message: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}
