import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'child_process';
import path from 'path';

const SCREENSHOT_SCRIPT = path.join(process.cwd(), 'python', 'screenshot', 'extract_frame.py');

/**
 * POST /api/screenshot - Extract screenshot from video using Python/FFmpeg
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { videoPath, timestamp } = body;

    if (!videoPath) {
      return NextResponse.json(
        { success: false, error: 'Video path is required' },
        { status: 400 }
      );
    }

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
