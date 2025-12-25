import { NextRequest, NextResponse } from 'next/server';
import { metricsStore } from '@/lib/metrics';

// CORS headers
const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
};

export async function OPTIONS() {
    return NextResponse.json({}, { headers: corsHeaders });
}

export async function GET(req: NextRequest) {
    try {
        const projectId = req.nextUrl.searchParams.get('projectId');
        const days = parseInt(req.nextUrl.searchParams.get('days') || '7');

        // Get today's stats
        const today = new Date();
        const startOfToday = new Date(today);
        startOfToday.setHours(0, 0, 0, 0);
        const endOfToday = new Date(today);
        endOfToday.setHours(23, 59, 59, 999);

        let todayStats;
        if (projectId) {
            todayStats = await metricsStore.getProjectStats(projectId, startOfToday, endOfToday);
        } else {
            // Get combined stats across all projects
            todayStats = await metricsStore.getAllStats(startOfToday, endOfToday);
        }

        // Get time series data
        const timeSeries = await metricsStore.getTimeSeriesData(projectId, days);

        // Get all projects summary
        const projectsSummary = await metricsStore.getAllProjectsStats(startOfToday, endOfToday);

        return NextResponse.json({
            today: todayStats,
            timeSeries,
            projects: projectsSummary
        }, { headers: corsHeaders, status: 200 });
    } catch (error) {
        console.error('Metrics query error:', error);
        // Return valid empty structure instead of error to prevent frontend crash
        return NextResponse.json({
            today: {
                uniqueVisitors: 0,
                totalPageViews: 0,
                customEvents: [],
                topPages: [],
                topCountries: [],
                topCities: []
            },
            timeSeries: [],
            projects: []
        }, { headers: corsHeaders, status: 200 });
    }
}
