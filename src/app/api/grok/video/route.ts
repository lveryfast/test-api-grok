import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { logVideoGeneration, logVideoError } from '@/lib/api-logger';
import { GrokVideoResponse } from '@/types/api';

const GROK_API_URL = 'https://api.x.ai/v1/videos/generate';
const API_KEY = process.env.GROK_API_KEY;
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // ms

// Zod schema for request validation
const VideoGenerationSchema = z.object({
  prompt: z.string().min(1, 'Prompt is required').max(10000, 'Prompt too long'),
  image: z.string().optional(),
  sceneNumber: z.number().int().positive().optional().default(1),
});

// Sanitize prompt to prevent injection issues
function sanitizePrompt(prompt: string): string {
  return prompt
    .trim()
    .slice(0, 10000) // Max length
    .replace(/[\x00-\x1F\x7F]/g, ''); // Remove control characters
}

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

  try {
    // Parse and validate request body
    const body = await request.json();
    const validation = VideoGenerationSchema.safeParse(body);

    if (!validation.success) {
      const errors = validation.error.errors.map((e) => e.message).join(', ');
      return NextResponse.json(
        { success: false, error: `Validation error: ${errors}` },
        { status: 400 }
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
        { status: 500 }
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
        { status: 500 }
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
    });
  } catch (error) {
    const duration = Date.now() - startTime;
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
