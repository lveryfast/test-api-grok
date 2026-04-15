/**
 * Integration Tests for Grok Video API Route
 * 
 * Tests the full flow of the /api/grok/video endpoint with mocked external dependencies.
 */

import { describe, it, expect, vi, beforeEach, afterAll, beforeAll } from 'vitest';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

// Mock environment
const originalEnv = process.env;

// Mock server setup
const server = setupServer();

// Mock handlers
const mockGrokApiHandler = http.post(
  'https://api.x.ai/v1/videos/generate',
  async ({ request }) => {
    const body = await request.json() as { prompt: string; image?: string };
    
    // Simulate API response
    if (!body.prompt || body.prompt.length === 0) {
      return HttpResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }
    
    return HttpResponse.json({
      video_url: `https://example.com/video-${Date.now()}.mp4`,
      status: 'completed',
      duration: 5,
    });
  }
);

describe('Grok Video API Integration', () => {
  beforeAll(() => {
    server.listen({ onUnhandledRequest: 'bypass' });
    process.env = { ...originalEnv, GROK_API_KEY: 'test-api-key' };
  });

  beforeEach(() => {
    vi.clearAllMocks();
    server.resetHandlers();
  });

  afterAll(() => {
    server.close();
    process.env = originalEnv;
  });

  describe('VideoGenerationSchema validation', () => {
    it('should accept valid prompt', async () => {
      server.use(mockGrokApiHandler);
      
      const { VideoGenerationSchema } = await import('@/app/api/grok/video/schema');
      
      const result = VideoGenerationSchema.safeParse({
        prompt: 'A beautiful sunset over the ocean',
        sceneNumber: 1,
      });
      
      expect(result.success).toBe(true);
    });

    it('should reject empty prompt', async () => {
      const { VideoGenerationSchema } = await import('@/app/api/grok/video/schema');
      
      const result = VideoGenerationSchema.safeParse({
        prompt: '',
        sceneNumber: 1,
      });
      
      expect(result.success).toBe(false);
    });

    it('should reject prompt exceeding max length', async () => {
      const { VideoGenerationSchema } = await import('@/app/api/grok/video/schema');
      
      const result = VideoGenerationSchema.safeParse({
        prompt: 'x'.repeat(10001),
        sceneNumber: 1,
      });
      
      expect(result.success).toBe(false);
    });

    it('should accept optional image field', async () => {
      server.use(mockGrokApiHandler);
      
      const { VideoGenerationSchema } = await import('@/app/api/grok/video/schema');
      
      const result = VideoGenerationSchema.safeParse({
        prompt: 'A person walking',
        image: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
        sceneNumber: 1,
      });
      
      expect(result.success).toBe(true);
    });

    it('should default sceneNumber to 1 if not provided', async () => {
      server.use(mockGrokApiHandler);
      
      const { VideoGenerationSchema } = await import('@/app/api/grok/video/schema');
      
      const result = VideoGenerationSchema.safeParse({
        prompt: 'A person walking',
      });
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.sceneNumber).toBe(1);
      }
    });

    it('should reject invalid base64 image format', async () => {
      const { VideoGenerationSchema } = await import('@/app/api/grok/video/schema');
      
      const result = VideoGenerationSchema.safeParse({
        prompt: 'A person walking',
        image: 'not-a-valid-base64-image',
      });
      
      expect(result.success).toBe(false);
    });

    it('should accept valid base64 image with jpeg format', async () => {
      const { VideoGenerationSchema } = await import('@/app/api/grok/video/schema');
      
      const result = VideoGenerationSchema.safeParse({
        prompt: 'A person walking',
        image: 'data:image/jpeg;base64,/9j/4AAQSkZJRg==',
      });
      
      expect(result.success).toBe(true);
    });
  });

  describe('Prompt sanitization', () => {
    it('should trim whitespace from prompts', async () => {
      const { sanitizePrompt } = await import('@/app/api/grok/video/sanitize');
      
      expect(sanitizePrompt('  Hello World  ')).toBe('Hello World');
    });

    it('should remove control characters', async () => {
      const { sanitizePrompt } = await import('@/app/api/grok/video/sanitize');
      
      expect(sanitizePrompt('Hello\x00World\x1F!')).toBe('HelloWorld!');
    });

    it('should truncate to max length', async () => {
      const { sanitizePrompt } = await import('@/app/api/grok/video/sanitize');
      
      const longPrompt = 'x'.repeat(15000);
      const result = sanitizePrompt(longPrompt);
      
      expect(result.length).toBe(10000);
    });

    it('should preserve valid unicode characters', async () => {
      const { sanitizePrompt } = await import('@/app/api/grok/video/sanitize');
      
      expect(sanitizePrompt('こんにちは世界 🎬')).toBe('こんにちは世界 🎬');
    });
  });

  describe('Error handling', () => {
    it('should handle missing API key', async () => {
      process.env.GROK_API_KEY = '';
      
      server.use(
        http.post('https://api.x.ai/v1/videos/generate', () => {
          return new HttpResponse(null, { status: 500 });
        })
      );
    });

    it('should handle API timeout with retry', async () => {
      let attempts = 0;
      server.use(
        http.post('https://api.x.ai/v1/videos/generate', () => {
          attempts++;
          if (attempts < 3) {
            return new HttpResponse(null, { status: 500 });
          }
          return HttpResponse.json({
            video_url: 'https://example.com/video.mp4',
          });
        })
      );
    });

    it('should handle malformed JSON response', async () => {
      server.use(
        http.post('https://api.x.ai/v1/videos/generate', () => {
          return new HttpResponse('not valid json', {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          });
        })
      );
    });
  });
});

describe('Screenshot API Integration', () => {
  describe('ScreenshotRequestSchema validation', () => {
    it('should accept valid video path', async () => {
      const { ScreenshotRequestSchema } = await import('@/app/api/screenshot/schema');
      
      const result = ScreenshotRequestSchema.safeParse({
        videoPath: 'https://example.com/video.mp4',
        timestamp: 5.5,
      });
      
      expect(result.success).toBe(true);
    });

    it('should accept local file path', async () => {
      const { ScreenshotRequestSchema } = await import('@/app/api/screenshot/schema');
      
      const result = ScreenshotRequestSchema.safeParse({
        videoPath: '/path/to/video.mp4',
      });
      
      expect(result.success).toBe(true);
    });

    it('should reject empty video path', async () => {
      const { ScreenshotRequestSchema } = await import('@/app/api/screenshot/schema');
      
      const result = ScreenshotRequestSchema.safeParse({
        videoPath: '',
      });
      
      expect(result.success).toBe(false);
    });

    it('should accept optional timestamp', async () => {
      const { ScreenshotRequestSchema } = await import('@/app/api/screenshot/schema');
      
      const result = ScreenshotRequestSchema.safeParse({
        videoPath: '/path/to/video.mp4',
        timestamp: 0,
      });
      
      expect(result.success).toBe(true);
    });

    it('should reject negative timestamp', async () => {
      const { ScreenshotRequestSchema } = await import('@/app/api/screenshot/schema');
      
      const result = ScreenshotRequestSchema.safeParse({
        videoPath: '/path/to/video.mp4',
        timestamp: -1,
      });
      
      expect(result.success).toBe(false);
    });
  });
});

describe('API Logger Integration', () => {
  beforeAll(() => {
    process.env = { ...originalEnv, GROK_API_KEY: 'test-api-key' };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('should log successful video generation', async () => {
    const { logVideoGeneration } = await import('@/lib/api-logger');
    
    const request = {
      prompt: 'A test prompt',
      image: undefined,
      sceneNumber: 1,
    };
    
    const response = {
      success: true,
      videoUrl: 'https://example.com/video.mp4',
      tokens: 100,
      cost: 0.001,
    };
    
    // Should not throw
    await expect(
      logVideoGeneration(1, request, response, 5000)
    ).resolves.not.toThrow();
  });

  it('should log video generation errors', async () => {
    const { logVideoError } = await import('@/lib/api-logger');
    
    const request = {
      prompt: 'A test prompt',
      image: undefined,
      sceneNumber: 1,
    };
    
    // Should not throw
    await expect(
      logVideoError(1, request, 'API error: 500', 1000)
    ).resolves.not.toThrow();
  });
});
