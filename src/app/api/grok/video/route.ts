import { NextRequest, NextResponse } from 'next/server';
import { GrokVideoRequest } from '@/types/api';

const GROK_API_URL = 'https://api.x.ai/v1/videos/generate';
const API_KEY = process.env.GROK_API_KEY;

/**
 * POST /api/grok/video - Generate video using Grok API
 */
export async function POST(request: NextRequest) {
  try {
    const body: GrokVideoRequest = await request.json();
    
    if (!body.prompt) {
      return NextResponse.json(
        { success: false, error: 'Prompt is required' },
        { status: 400 }
      );
    }

    if (!API_KEY) {
      return NextResponse.json(
        { success: false, error: 'Grok API key not configured' },
        { status: 500 }
      );
    }

    // Build the request to Grok API
    const grokRequest: Record<string, unknown> = {
      prompt: body.prompt,
    };

    // Add image if provided (for scene continuity)
    if (body.image) {
      grokRequest.image = body.image;
    }

    const startTime = Date.now();

    // Call Grok API
    const response = await fetch(GROK_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(grokRequest),
    });

    const duration = Date.now() - startTime;

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Grok API error:', response.status, errorText);
      
      return NextResponse.json(
        {
          success: false,
          error: `Grok API error: ${response.status}`,
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    // Calculate estimated tokens and cost
    const promptTokens = Math.ceil(body.prompt.length / 4);
    const estimatedCost = promptTokens * 0.00001; // Example cost calculation

    return NextResponse.json({
      success: true,
      videoUrl: data.video_url || data.url,
      tokens: promptTokens,
      cost: estimatedCost,
      generationTime: duration,
      sceneNumber: body.sceneNumber,
    });
  } catch (error) {
    console.error('Error generating video:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}
