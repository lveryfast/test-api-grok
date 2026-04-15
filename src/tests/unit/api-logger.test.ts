import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('api-logger', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('generateLogId', () => {
    it('should generate unique IDs', async () => {
      const { generateLogId } = await import('@/lib/api-logger');
      const id1 = generateLogId();
      const id2 = generateLogId();

      expect(id1).not.toBe(id2);
      expect(id1).toMatch(/^log_\d+_[a-z0-9]+$/);
    });
  });

  describe('createApiLog', () => {
    it('should create a valid log entry', async () => {
      const { createApiLog } = await import('@/lib/api-logger');

      const log = createApiLog(
        1,
        { prompt: 'test prompt', sceneNumber: 1 },
        { success: true, videoUrl: 'http://test.com/video.mp4' },
        1000
      );

      expect(log.id).toMatch(/^log_/);
      expect(log.sceneNumber).toBe(1);
      expect(log.request.prompt).toBe('test prompt');
      expect(log.request.hasImage).toBe(false);
      expect(log.response.success).toBe(true);
      expect(log.duration).toBe(1000);
      expect(log.timestamp).toBeDefined();
    });

    it('should set hasImage to true when image is provided', async () => {
      const { createApiLog } = await import('@/lib/api-logger');

      const log = createApiLog(
        1,
        { prompt: 'test', image: 'base64...', sceneNumber: 1 },
        { success: true, videoUrl: 'http://test.com/video.mp4' },
        500
      );

      expect(log.request.hasImage).toBe(true);
    });
  });

  describe('saveApiLog', () => {
    it('should call API endpoint', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
      });

      const { saveApiLog, generateLogId } = await import('@/lib/api-logger');

      const log = {
        id: generateLogId(),
        timestamp: new Date().toISOString(),
        sceneNumber: 1,
        request: { prompt: 'test', hasImage: false },
        response: { success: true },
        duration: 500,
      };

      await saveApiLog(log);

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/logs',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        })
      );
    });
  });
});
