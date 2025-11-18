import postgres from 'postgres';

// Use local postgres for development, Vercel Postgres for production
const isProduction = process.env.VERCEL || process.env.NODE_ENV === 'production';

let sql: any;

if (isProduction) {
  // Production: Use Vercel Postgres
  const { sql: vercelSql } = require('@vercel/postgres');
  sql = vercelSql;
} else {
  // Development: Use local postgres
  if (!process.env.POSTGRES_URL) {
    throw new Error('POSTGRES_URL environment variable is required for local development. Please set it in .env.local');
  }
  sql = postgres(process.env.POSTGRES_URL);
}

// Initialize tables (run this once or use migrations)
export async function initDatabase() {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS events (
        id SERIAL PRIMARY KEY,
        project_id TEXT NOT NULL,
        event_type TEXT NOT NULL,
        event_data JSONB,
        visitor_id TEXT,
        path TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS page_views (
        id SERIAL PRIMARY KEY,
        project_id TEXT NOT NULL,
        path TEXT NOT NULL,
        visitor_id TEXT NOT NULL,
        referrer TEXT,
        user_agent TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS custom_events (
        id SERIAL PRIMARY KEY,
        project_id TEXT NOT NULL,
        event_name TEXT NOT NULL,
        properties JSONB,
        visitor_id TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Create indexes
    await sql`CREATE INDEX IF NOT EXISTS idx_events_project ON events(project_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_events_created_at ON events(created_at)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_events_type ON events(event_type)`;
    
    await sql`CREATE INDEX IF NOT EXISTS idx_page_views_project ON page_views(project_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_page_views_created_at ON page_views(created_at)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_page_views_path ON page_views(path)`;
    
    await sql`CREATE INDEX IF NOT EXISTS idx_custom_events_project ON custom_events(project_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_custom_events_created_at ON custom_events(created_at)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_custom_events_name ON custom_events(event_name)`;

    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Database initialization error:', error);
  }
}

export { sql };
