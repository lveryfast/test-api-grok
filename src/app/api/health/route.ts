import { NextResponse } from 'next/server';

/**
 * GET /api/health - Health check endpoint
 */
export async function GET() {
  const hasApiKey = !!process.env.GROK_API_KEY;
  
  return NextResponse.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    apiKeyConfigured: hasApiKey,
  });
}
