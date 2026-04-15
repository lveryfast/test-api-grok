import { GrokApiLog, GrokVideoRequest, GrokVideoResponse } from '@/types/api';

const LOG_FILE_ENDPOINT = '/api/logs';
const MAX_RETRIES = 3;

/**
 * Generate a unique ID for log entries
 */
export function generateLogId(): string {
  return `log_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
}

/**
 * Create a new API log entry
 */
export function createApiLog(
  sceneNumber: number,
  request: GrokVideoRequest,
  response: GrokVideoResponse,
  duration: number
): GrokApiLog {
  return {
    id: generateLogId(),
    timestamp: new Date().toISOString(),
    sceneNumber,
    request: {
      prompt: request.prompt,
      hasImage: !!request.image,
    },
    response,
    duration,
  };
}

/**
 * Send log entry to the backend with retry logic
 */
async function sendLogWithRetry(
  log: GrokApiLog,
  attempt: number = 1
): Promise<boolean> {
  try {
    const response = await fetch(LOG_FILE_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(log),
    });

    if (!response.ok) {
      console.error(`[LOG ERROR] Failed to save log (attempt ${attempt}):`, response.statusText);

      if (attempt < MAX_RETRIES) {
        // Exponential backoff
        const delay = Math.pow(2, attempt) * 100;
        console.log(`[LOG] Retrying in ${delay}ms...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
        return sendLogWithRetry(log, attempt + 1);
      }

      return false;
    }

    return true;
  } catch (error) {
    console.error(`[LOG ERROR] Network error (attempt ${attempt}):`, error);

    if (attempt < MAX_RETRIES) {
      const delay = Math.pow(2, attempt) * 100;
      console.log(`[LOG] Retrying in ${delay}ms...`);
      await new Promise((resolve) => setTimeout(resolve, delay));
      return sendLogWithRetry(log, attempt + 1);
    }

    // Fallback: store in localStorage if all retries fail
    try {
      const logs = JSON.parse(localStorage.getItem('failed_logs') || '[]');
      logs.push(log);
      localStorage.setItem('failed_logs', JSON.stringify(logs));
      console.warn('[LOG] Saved to localStorage as fallback');
      return true;
    } catch {
      console.error('[LOG FATAL] Could not save log anywhere:', error);
      return false;
    }
  }
}

/**
 * Save log entry (non-blocking)
 * If logging fails after retries, it falls back to localStorage
 */
export async function saveApiLog(log: GrokApiLog): Promise<void> {
  // Fire and forget - don't block the main flow
  sendLogWithRetry(log).catch((error) => {
    console.error('[LOG FATAL] Unexpected error:', error);
  });
}

/**
 * Log a successful video generation
 */
export async function logVideoGeneration(
  sceneNumber: number,
  request: GrokVideoRequest,
  response: GrokVideoResponse,
  duration: number
): Promise<void> {
  const log = createApiLog(sceneNumber, request, response, duration);
  await saveApiLog(log);
  console.log(`[API LOG] Scene ${sceneNumber}: Success (${duration}ms)`);
}

/**
 * Log a failed video generation
 */
export async function logVideoError(
  sceneNumber: number,
  request: GrokVideoRequest,
  error: string,
  duration: number
): Promise<void> {
  const log: GrokApiLog = {
    id: generateLogId(),
    timestamp: new Date().toISOString(),
    sceneNumber,
    request: {
      prompt: request.prompt,
      hasImage: !!request.image,
    },
    response: {
      success: false,
      error,
    },
    duration,
  };
  await saveApiLog(log);
  console.error(`[API LOG] Scene ${sceneNumber}: Error - ${error} (${duration}ms)`);
}

/**
 * Flush failed logs from localStorage to server
 * Call this on app startup or periodically
 */
export async function flushFailedLogs(): Promise<void> {
  try {
    const failedLogs = JSON.parse(localStorage.getItem('failed_logs') || '[]');
    if (failedLogs.length === 0) return;

    console.log(`[LOG] Flushing ${failedLogs.length} failed logs...`);

    for (const log of failedLogs) {
      const success = await sendLogWithRetry(log);
      if (!success) {
        console.error('[LOG] Could not flush log:', log.id);
      }
    }

    // Clear localStorage on success
    localStorage.removeItem('failed_logs');
  } catch (error) {
    console.error('[LOG ERROR] Failed to flush logs:', error);
  }
}
