import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { spawn } from 'child_process';
import path from 'path';

const SCREENSHOT_SCRIPT = path.join(process.cwd(), 'python', 'screenshot', 'extract_frame.py');

// Zod schema for request validation
const ScreenshotRequestSchema = z.object({
  videoPath: z.string().min(1, 'Video path is required').url('Invalid URL format'),
  timestamp: z.number().positive().optional(),
});

/**
 * POST /api/screenshot - Extract screenshot from video using Python/FFmpeg
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = ScreenshotRequestSchema.safeParse(body);

    if (!validation.success) {
      const errors = validation.error.errors.map((e) => e.message).join(', ');
      return NextResponse.json(
        { success: false, error: `Validation error: ${errors}` },
        { status: 400 }
      );
    }

    const { videoPath, timestamp } = validation.data;

    // Ensure screenshots directory exists
    const screenshotsDir = path.join(process.cwd(), 'python', 'screenshots');
    const outputPath = path.join(screenshotsDir, `screenshot_${Date.now()}.png`);

    // Run Python script
    const result = await runPythonScript(videoPath, outputPath, timestamp);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      screenshotPath: result.screenshotPath,
    });
  } catch (error) {
    console.error('Screenshot extraction error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}

function runPythonScript(
  videoPath: string,
  outputPath: string,
  timestamp?: number
): Promise<{ success: boolean; screenshotPath?: string; error?: string }> {
  return new Promise((resolve) => {
    const args = [SCREENSHOT_SCRIPT, videoPath, outputPath];
    if (timestamp !== undefined) {
      args.push('--timestamp', String(timestamp));
    }

    const python = spawn('python', args);
    let stdout = '';
    let stderr = '';

    python.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    python.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    python.on('close', (code) => {
      if (code === 0) {
        resolve({ success: true, screenshotPath: outputPath });
      } else {
        console.error('Python script error:', stderr);
        resolve({ success: false, error: stderr || 'Script execution failed' });
      }
    });

    python.on('error', (error) => {
      console.error('Python spawn error:', error);
      resolve({ success: false, error: error.message });
    });
  });
}
