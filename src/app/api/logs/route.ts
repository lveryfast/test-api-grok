import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { GrokApiLog } from '@/types/api';

const LOGS_DIR = path.join(process.cwd(), 'python', 'logs');
const LOG_FILE = path.join(LOGS_DIR, 'api_calls.log');

/**
 * Ensure logs directory exists
 */
function ensureLogsDir(): void {
  if (!fs.existsSync(LOGS_DIR)) {
    fs.mkdirSync(LOGS_DIR, { recursive: true });
  }
}

/**
 * Append a log entry to the log file
 */
function appendToLog(log: GrokApiLog): void {
  ensureLogsDir();
  const logLine = JSON.stringify(log) + '\n';
  fs.appendFileSync(LOG_FILE, logLine, 'utf-8');
}

/**
 * Get all logs from the log file
 */
function getLogs(): GrokApiLog[] {
  ensureLogsDir();
  
  if (!fs.existsSync(LOG_FILE)) {
    return [];
  }

  const content = fs.readFileSync(LOG_FILE, 'utf-8');
  const lines = content.split('\n').filter((line) => line.trim());
  
  return lines.map((line) => {
    try {
      return JSON.parse(line) as GrokApiLog;
    } catch {
      return null;
    }
  }).filter((log): log is GrokApiLog => log !== null);
}

/**
 * POST /api/logs - Save a new log entry
 */
export async function POST(request: NextRequest) {
  try {
    const log = await request.json() as GrokApiLog;
    appendToLog(log);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving log:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to save log' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/logs - Get all logs
 */
export async function GET() {
  try {
    const logs = getLogs();
    return NextResponse.json({ logs });
  } catch (error) {
    console.error('Error reading logs:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to read logs' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/logs - Clear all logs
 */
export async function DELETE() {
  try {
    ensureLogsDir();
    if (fs.existsSync(LOG_FILE)) {
      fs.unlinkSync(LOG_FILE);
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error clearing logs:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to clear logs' },
      { status: 500 }
    );
  }
}
