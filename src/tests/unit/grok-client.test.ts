import { describe, it, expect, vi, beforeEach, afterAll } from 'vitest';

// Mock environment
const originalEnv = process.env;

describe('grok-client', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env = { ...originalEnv, GROK_API_KEY: 'test-key' };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe('generateVideo', () => {
    it('should be defined as a function', async () => {
      const { generateVideo } = await import('@/lib/grok-client');
      expect(typeof generateVideo).toBe('function');
    });
  });
});
