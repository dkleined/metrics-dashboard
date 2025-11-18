import { NextRequest, NextResponse } from 'next/server';
import { initDatabase } from '@/lib/db';

// Call this once to initialize database tables
// Protected by METRICS_SECRET
export async function GET(req: NextRequest) {
  // Check for authorization
  const authHeader = req.headers.get('authorization');
  const secret = process.env.METRICS_SECRET;

  if (!secret) {
    return NextResponse.json({
      success: false,
      error: 'Server configuration error'
    }, { status: 500 });
  }

  if (authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({
      success: false,
      error: 'Unauthorized'
    }, { status: 401 });
  }

  try {
    await initDatabase();
    return NextResponse.json({
      success: true,
      message: 'Database initialized successfully'
    });
  } catch (error) {
    console.error('Database initialization failed:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
