import {sql} from './db';

export type MetricEvent = {
    projectId: string;
    eventType: 'page_view' | 'custom_event';
    visitorId?: string;
    path?: string;
    eventName?: string;
    properties?: Record<string, any>;
    referrer?: string;
    userAgent?: string;
    ipAddress?: string;
    city?: string;
    region?: string;
    country?: string;
};

export class MetricsStore {
    async ingestEvent(event: MetricEvent) {
        if (event.eventType === 'page_view' && event.path) {
            await sql`
                INSERT INTO page_views (project_id, path, visitor_id, referrer, user_agent, ip_address, city, region, country)
                VALUES (${event.projectId}, ${event.path}, ${event.visitorId || 'anonymous'}, ${event.referrer || null}, ${event.userAgent || null}, ${event.ipAddress || null}, ${event.city || null}, ${event.region || null}, ${event.country || null})
            `;
        } else if (event.eventType === 'custom_event' && event.eventName) {
            await sql`
                INSERT INTO custom_events (project_id, event_name, properties, visitor_id)
                VALUES (${event.projectId}, ${event.eventName}, ${event.properties ? JSON.stringify(event.properties) : null}, ${event.visitorId || 'anonymous'})
            `;
        }

        // Also store in generic events table for unified querying
        await sql`
            INSERT INTO events (project_id, event_type, event_data, visitor_id, path)
            VALUES (${event.projectId}, ${event.eventType}, ${JSON.stringify(event)}, ${event.visitorId || 'anonymous'}, ${event.path || null})
        `;
    }

    async getAllStats(startDate: Date, endDate: Date) {
        // Unique visitors across all projects
        const visitors = await sql`
            SELECT COUNT(DISTINCT visitor_id) as count
            FROM page_views
            WHERE created_at >= ${startDate.toISOString()}
            AND created_at <= ${endDate.toISOString()}
        `;

        // Total page views across all projects
        const pageViews = await sql`
            SELECT COUNT(*) as count
            FROM page_views
            WHERE created_at >= ${startDate.toISOString()}
            AND created_at <= ${endDate.toISOString()}
        `;

        // Custom events count across all projects
        const customEvents = await sql`
            SELECT event_name, COUNT(*) as count
            FROM custom_events
            WHERE created_at >= ${startDate.toISOString()}
            AND created_at <= ${endDate.toISOString()}
            GROUP BY event_name
        `;

        // Top pages across all projects (grouped by project)
        const topPages = await sql`
            SELECT project_id, path, COUNT(*) as views
            FROM page_views
            WHERE created_at >= ${startDate.toISOString()}
            AND created_at <= ${endDate.toISOString()}
            GROUP BY project_id, path
            ORDER BY project_id, views DESC
        `;

        // Top countries across all projects
        const topCountries = await sql`
            SELECT country, COUNT(DISTINCT visitor_id) as visitors
            FROM page_views
            WHERE created_at >= ${startDate.toISOString()}
            AND created_at <= ${endDate.toISOString()}
            AND country IS NOT NULL
            AND country != 'Unknown'
            GROUP BY country
            ORDER BY visitors DESC
            LIMIT 10
        `;

        // Top cities across all projects
        const topCities = await sql`
            SELECT city, region, country, COUNT(DISTINCT visitor_id) as visitors
            FROM page_views
            WHERE created_at >= ${startDate.toISOString()}
            AND created_at <= ${endDate.toISOString()}
            AND city IS NOT NULL
            AND city != 'Unknown'
            GROUP BY city, region, country
            ORDER BY visitors DESC
            LIMIT 10
        `;

        // Handle both postgres and @vercel/postgres result formats
        const visitorsArray = Array.isArray(visitors) ? visitors : visitors.rows;
        const pageViewsArray = Array.isArray(pageViews) ? pageViews : pageViews.rows;
        const customEventsArray = Array.isArray(customEvents) ? customEvents : customEvents.rows;
        const topPagesArray = Array.isArray(topPages) ? topPages : topPages.rows;
        const topCountriesArray = Array.isArray(topCountries) ? topCountries : topCountries.rows;
        const topCitiesArray = Array.isArray(topCities) ? topCities : topCities.rows;

        return {
            uniqueVisitors: Number((visitorsArray[0] as any)?.count || 0),
            totalPageViews: Number((pageViewsArray[0] as any)?.count || 0),
            customEvents: (customEventsArray as any[]).map((e: any) => ({ event_name: e.event_name, count: Number(e.count) })),
            topPages: (topPagesArray as any[]).map((p: any) => ({ project_id: p.project_id, path: p.path, views: Number(p.views) })),
            topCountries: (topCountriesArray as any[]).map((c: any) => ({ country: c.country, visitors: Number(c.visitors) })),
            topCities: (topCitiesArray as any[]).map((c: any) => ({ city: c.city, region: c.region, country: c.country, visitors: Number(c.visitors) }))
        };
    }

    async getProjectStats(projectId: string, startDate: Date, endDate: Date) {
        // Unique visitors
        const visitors = await sql`
            SELECT COUNT(DISTINCT visitor_id) as count
            FROM page_views
            WHERE project_id = ${projectId}
            AND created_at >= ${startDate.toISOString()}
            AND created_at <= ${endDate.toISOString()}
        `;

        // Total page views
        const pageViews = await sql`
            SELECT COUNT(*) as count
            FROM page_views
            WHERE project_id = ${projectId}
            AND created_at >= ${startDate.toISOString()}
            AND created_at <= ${endDate.toISOString()}
        `;

        // Custom events count
        const customEvents = await sql`
            SELECT event_name, COUNT(*) as count
            FROM custom_events
            WHERE project_id = ${projectId}
            AND created_at >= ${startDate.toISOString()}
            AND created_at <= ${endDate.toISOString()}
            GROUP BY event_name
        `;

        // Top pages
        const topPages = await sql`
            SELECT path, COUNT(*) as views
            FROM page_views
            WHERE project_id = ${projectId}
            AND created_at >= ${startDate.toISOString()}
            AND created_at <= ${endDate.toISOString()}
            GROUP BY path
            ORDER BY views DESC
            LIMIT 10
        `;

        // Top countries
        const topCountries = await sql`
            SELECT country, COUNT(DISTINCT visitor_id) as visitors
            FROM page_views
            WHERE project_id = ${projectId}
            AND created_at >= ${startDate.toISOString()}
            AND created_at <= ${endDate.toISOString()}
            AND country IS NOT NULL
            AND country != 'Unknown'
            GROUP BY country
            ORDER BY visitors DESC
            LIMIT 10
        `;

        // Top cities
        const topCities = await sql`
            SELECT city, region, country, COUNT(DISTINCT visitor_id) as visitors
            FROM page_views
            WHERE project_id = ${projectId}
            AND created_at >= ${startDate.toISOString()}
            AND created_at <= ${endDate.toISOString()}
            AND city IS NOT NULL
            AND city != 'Unknown'
            GROUP BY city, region, country
            ORDER BY visitors DESC
            LIMIT 10
        `;

        // Handle both postgres and @vercel/postgres result formats
        const visitorsArray = Array.isArray(visitors) ? visitors : visitors.rows;
        const pageViewsArray = Array.isArray(pageViews) ? pageViews : pageViews.rows;
        const customEventsArray = Array.isArray(customEvents) ? customEvents : customEvents.rows;
        const topPagesArray = Array.isArray(topPages) ? topPages : topPages.rows;
        const topCountriesArray = Array.isArray(topCountries) ? topCountries : topCountries.rows;
        const topCitiesArray = Array.isArray(topCities) ? topCities : topCities.rows;

        return {
            uniqueVisitors: Number((visitorsArray[0] as any)?.count || 0),
            totalPageViews: Number((pageViewsArray[0] as any)?.count || 0),
            customEvents: (customEventsArray as any[]).map((e: any) => ({ event_name: e.event_name, count: Number(e.count) })),
            topPages: (topPagesArray as any[]).map((p: any) => ({ path: p.path, views: Number(p.views) })),
            topCountries: (topCountriesArray as any[]).map((c: any) => ({ country: c.country, visitors: Number(c.visitors) })),
            topCities: (topCitiesArray as any[]).map((c: any) => ({ city: c.city, region: c.region, country: c.country, visitors: Number(c.visitors) }))
        };
    }

    async getAllProjectsStats(startDate: Date, endDate: Date) {
        const projects = await sql`
            SELECT DISTINCT project_id FROM page_views
        `;

        // Handle both postgres and @vercel/postgres result formats
        const projectsArray = Array.isArray(projects) ? projects : projects.rows;

        return await Promise.all(
            (projectsArray as any[]).map(async (p: any) => ({
                projectId: p.project_id,
                ...(await this.getProjectStats(p.project_id, startDate, endDate))
            }))
        );
    }

    async getTimeSeriesData(projectId: string | null, days: number = 7) {
        const data = [];
        const now = new Date();
        
        for (let i = days - 1; i >= 0; i--) {
            const date = new Date(now);
            date.setDate(date.getDate() - i);
            
            const startOfDay = new Date(date);
            startOfDay.setHours(0, 0, 0, 0);
            
            const endOfDay = new Date(date);
            endOfDay.setHours(23, 59, 59, 999);
            
            let visitors, pageViews, events;
            
            if (projectId) {
                visitors = await sql`
                    SELECT COUNT(DISTINCT visitor_id) as count
                    FROM page_views
                    WHERE project_id = ${projectId}
                    AND created_at >= ${startOfDay.toISOString()}
                    AND created_at <= ${endOfDay.toISOString()}
                `;
                
                pageViews = await sql`
                    SELECT COUNT(*) as count
                    FROM page_views
                    WHERE project_id = ${projectId}
                    AND created_at >= ${startOfDay.toISOString()}
                    AND created_at <= ${endOfDay.toISOString()}
                `;
                
                events = await sql`
                    SELECT COUNT(*) as count
                    FROM custom_events
                    WHERE project_id = ${projectId}
                    AND created_at >= ${startOfDay.toISOString()}
                    AND created_at <= ${endOfDay.toISOString()}
                `;
            } else {
                visitors = await sql`
                    SELECT COUNT(DISTINCT visitor_id) as count
                    FROM page_views
                    WHERE created_at >= ${startOfDay.toISOString()}
                    AND created_at <= ${endOfDay.toISOString()}
                `;
                
                pageViews = await sql`
                    SELECT COUNT(*) as count
                    FROM page_views
                    WHERE created_at >= ${startOfDay.toISOString()}
                    AND created_at <= ${endOfDay.toISOString()}
                `;
                
                events = await sql`
                    SELECT COUNT(*) as count
                    FROM custom_events
                    WHERE created_at >= ${startOfDay.toISOString()}
                    AND created_at <= ${endOfDay.toISOString()}
                `;
            }
            
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            
            // Handle both postgres and @vercel/postgres result formats
            const visitorsArray = Array.isArray(visitors) ? visitors : visitors.rows;
            const pageViewsArray = Array.isArray(pageViews) ? pageViews : pageViews.rows;
            const eventsArray = Array.isArray(events) ? events : events.rows;

            data.push({
                date: `${year}-${month}-${day}`,
                visitors: Number((visitorsArray[0] as any)?.count || 0),
                pageViews: Number((pageViewsArray[0] as any)?.count || 0),
                events: Number((eventsArray[0] as any)?.count || 0)
            });
        }
        
        return data;
    }
}

export const metricsStore = new MetricsStore();
