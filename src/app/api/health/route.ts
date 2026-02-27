/**
 * GET /api/health
 *
 * Health check endpoint for monitoring.
 * Returns basic system status — no authentication required.
 */

import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
}
