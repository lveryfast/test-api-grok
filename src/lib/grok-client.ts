import { GrokVideoRequest, GrokVideoResponse } from '@/types/api';
import { logVideoGeneration, logVideoError } from './api-logger';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

/**
 * Call Grok Video API to generate a video
 */
export async function generateVideo(
  request: GrokVideoRequest,
  sceneNumber: number
): Promise<GrokVideoResponse> {
  const startTime = Date.now();

  try {
    const response = await fetch(`${API_BASE_URL}/api/grok/video`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    const duration = Date.now() - startTime;
    const data = await response.json();

    if (!response.ok) {
      const errorResponse: GrokVideoResponse = {
        success: false,
        error: data.error || 'Unknown error occurred',
      };
      await logVideoError(sceneNumber, request, errorResponse.error || 'Unknown error', duration);
      return errorResponse;
    }

    const successResponse: GrokVideoResponse = {
      success: true,
      videoUrl: data.videoUrl,
      tokens: data.tokens,
      cost: data.cost,
    };

    await logVideoGeneration(sceneNumber, request, successResponse, duration);
    return successResponse;
  } catch (error) {
    const duration = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : 'Network error';
    
    await logVideoError(sceneNumber, request, errorMessage, duration);
    
    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Check if the API is configured and accessible
 */
export async function checkApiHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/health`, {
      method: 'GET',
    });
    return response.ok;
  } catch {
    return false;
  }
}
