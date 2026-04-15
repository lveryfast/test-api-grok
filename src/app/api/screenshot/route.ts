import { NextRequest, NextResponse } from 'next/server';
import ffmpeg from 'fluent-ffmpeg';
import path from 'path';
import fs from 'fs';
import { ScreenshotRequestSchema } from './schema';
import { 
  checkRateLimit, 
  getClientId, 
  SCREENSHOT_RATE_LIMIT 
} from '@/lib/rate-limiter';

interface FFmpegMetadata {
  format?: {
    duration?: number;
  };
}

/**
 * Get video duration using fluent-ffmpeg
 */
function getVideoDuration(inputPath: string): Promise<number> {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(inputPath, (err: Error | null, metadata: FFmpegMetadata) => {
      if (err) {
        reject(new Error(`Failed to get video duration: ${err.message}`));
        return;
      }
      resolve(metadata.format?.duration || 0);
    });
  });
}

/**
 * Extract a frame from video using fluent-ffmpeg
 */
function extractFrame(
  inputPath: string,
  outputPath: string,
  timestamp?: number
): Promise<string> {
  return new Promise((resolve, reject) => {
    // Ensure output directory exists
    const outputDir = path.dirname(outputPath);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    let command = ffmpeg(inputPath)
      .outputOptions([
        '-vframes', '1',
        '-q:v', '2',
      ])
      .output(outputPath);

    if (timestamp !== undefined) {
      command = command.seekInput(timestamp);
    }

    command
      .on('end', () => resolve(outputPath))
      .on('error', (err: Error) => reject(err))
      .run();
  });
}

/**
 * POST /api/screenshot - Extract screenshot from video using FFmpeg (Node.js)
 */
export async function POST(request: NextRequest) {
  // Rate limiting check
  const clientId = getClientId(request);
  const rateLimit = checkRateLimit(clientId, SCREENSHOT_RATE_LIMIT);
  
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
    const body = await request.json();
    const validation = ScreenshotRequestSchema.safeParse(body);

    if (!validation.success) {
      const errors = validation.error.errors.map((e) => e.message).join(', ');
      return NextResponse.json(
        { success: false, error: `Validation error: ${errors}` },
        { status: 400, headers }
      );
    }

    const { videoPath, timestamp } = validation.data;

    // Ensure screenshots directory exists
    const screenshotsDir = path.join(process.cwd(), 'python', 'screenshots');
    if (!fs.existsSync(screenshotsDir)) {
      fs.mkdirSync(screenshotsDir, { recursive: true });
    }

    const outputPath = path.join(screenshotsDir, `screenshot_${Date.now()}.png`);

    // If no timestamp provided, get the last frame
    let extractTimestamp = timestamp;
    if (extractTimestamp === undefined) {
      try {
        const duration = await getVideoDuration(videoPath);
        extractTimestamp = Math.max(0, duration - 0.1);
      } catch {
        // Use default if we can't get duration
        extractTimestamp = 0;
      }
    }

    await extractFrame(videoPath, outputPath, extractTimestamp);

    return NextResponse.json({
      success: true,
      screenshotPath: outputPath,
    }, { headers });
  } catch (error) {
    console.error('Screenshot extraction error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500, headers }
    );
  }
}
