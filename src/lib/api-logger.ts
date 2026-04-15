import { GrokApiLog, GrokVideoRequest, GrokVideoResponse } from '@/types/api';

const LOG_FILE_ENDPOINT = '/api/logs';

/**
 * Send log entry to the backend to be written to file
 */
export async function saveApiLog(log: GrokApiLog): Promise<void> {
  try {
    const response = await fetch(LOG_FILE_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(log),
    });

    if (!response.ok) {
      console.error('Failed to save API log:', response.statusText);
    }
  } catch (error) {
    console.error('Error saving API log:', error);
  }
}

/**
 * Generate a unique ID for log entries
 */
export function generateLogId(): string {
  return `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
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
