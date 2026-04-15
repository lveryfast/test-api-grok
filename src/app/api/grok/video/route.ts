import { NextRequest, NextResponse } from 'next/server';
import { logVideoGeneration, logVideoError } from '@/lib/api-logger';
import { GrokVideoResponse } from '@/types/api';
import { VideoGenerationSchema } from './schema';
import { sanitizePrompt } from './sanitize';
import { 
  checkRateLimit, 
  getClientId, 
  VIDEO_GENERATION_RATE_LIMIT 
} from '@/lib/rate-limiter';

const GROK_API_URL = 'https://api.x.ai/v1/videos/generate';
const API_KEY = process.env.GROK_API_KEY;
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // ms

/**
 * Call Grok API with retry logic
 */
async function callGrokApi(
  sanitizedPrompt: string,
  image?: string,
  attempt: number = 1
): Promise<{ success: boolean; data?: Record<string, unknown>; error?: string }> {
  const grokRequest: Record<string, unknown> = {
    prompt: sanitizedPrompt,
  };

  if (image) {
    grokRequest.image = image;
  }

  try {
    const response = await fetch(GROK_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(grokRequest),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Grok API error (attempt ${attempt}):`, response.status, errorText);
      return { success: false, error: `Grok API error: ${response.status}` };
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error(`Grok API error (attempt ${attempt}):`, error);

    // Retry logic
    if (attempt < MAX_RETRIES) {
      const delay = RETRY_DELAY * attempt;
      console.log(`Retrying in ${delay}ms...`);
      await new Promise((resolve) => setTimeout(resolve, delay));
      return callGrokApi(sanitizedPrompt, image, attempt + 1);
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error after retries',
    };
  }
}

/**
 * POST /api/grok/video - Generate video using Grok API
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now();

  // Rate limiting check (before try block)
  const clientId = getClientId(request);
  const rateLimit = checkRateLimit(clientId, VIDEO_GENERATION_RATE_LIMIT);
  
  // Set rate limit headers
  const headers = new Headers({
    'X-RateLimit-Limit': String(rateLimit.total),
    'X-RateLimit-Remaining': String(rateLimit.remaining),
    'X-RateLimit-Reset': String(Math.ceil(rateLimit.resetAt / 1000)),
  });

  if (rateLimit.isLimited) {
    return NextResponse.json(
      { 
        success: false, 
        error: 'Rate limit exceeded. Please wait before making another request.',
        retryAfter: Math.ceil((rateLimit.resetAt - Date.now()) / 1000),
      },
      { 
        status: 429,
        headers,
      }
    );
  }

  try {
    // Parse and validate request body
    const body = await request.json();
    const validation = VideoGenerationSchema.safeParse(body);

    if (!validation.success) {
      const errors = validation.error.errors.map((e) => e.message).join(', ');
      return NextResponse.json(
        { success: false, error: `Validation error: ${errors}` },
        { status: 400, headers }
      );
    }

    const { prompt, image, sceneNumber } = validation.data;

    // Check API key
    if (!API_KEY) {
      const duration = Date.now() - startTime;
      const errorMsg = 'Grok API key not configured';
      await logVideoError(sceneNumber, { prompt, image, sceneNumber }, errorMsg, duration);
      return NextResponse.json(
        { success: false, error: errorMsg },
        { status: 500, headers }
      );
    }

    // Sanitize prompt
    const sanitizedPrompt = sanitizePrompt(prompt);

    // Call Grok API with retry
    const result = await callGrokApi(sanitizedPrompt, image);
    const duration = Date.now() - startTime;

    if (!result.success || !result.data) {
      await logVideoError(sceneNumber, { prompt: sanitizedPrompt, image, sceneNumber }, result.error || 'Unknown error', duration);
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500, headers }
      );
    }

    // Calculate estimated tokens and cost
    const promptTokens = Math.ceil(sanitizedPrompt.length / 4);
    const estimatedCost = promptTokens * 0.00001;

    const videoUrl = (result.data?.video_url || result.data?.url) as string | undefined;

    const response: GrokVideoResponse = {
      success: true,
      videoUrl,
      tokens: promptTokens,
      cost: estimatedCost,
    };

    // Log successful generation
    await logVideoGeneration(
      sceneNumber,
      { prompt: sanitizedPrompt, image, sceneNumber },
      response,
      duration
    );

    return NextResponse.json({
      ...response,
      generationTime: duration,
      sceneNumber,
    }, { headers });
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error('Error generating video:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500, headers }
    );
  }
}
