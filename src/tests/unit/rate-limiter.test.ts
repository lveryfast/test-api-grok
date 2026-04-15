/**
 * Unit Tests for Rate Limiter
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  checkRateLimit,
  getClientId,
  clearAllRateLimits,
  resetRateLimit,
  VIDEO_GENERATION_RATE_LIMIT,
  SCREENSHOT_RATE_LIMIT,
} from '@/lib/rate-limiter';

describe('rate-limiter', () => {
  beforeEach(() => {
    // Clear all rate limits before each test
    clearAllRateLimits();
  });

  afterEach(() => {
    clearAllRateLimits();
  });

  describe('checkRateLimit', () => {
    it('should allow first request within limit', () => {
      const result = checkRateLimit('test-client-1', VIDEO_GENERATION_RATE_LIMIT);
      
      expect(result.isLimited).toBe(false);
      expect(result.remaining).toBe(VIDEO_GENERATION_RATE_LIMIT.maxRequests - 1);
      expect(result.total).toBe(VIDEO_GENERATION_RATE_LIMIT.maxRequests);
      expect(result.resetAt).toBeGreaterThan(Date.now());
    });

    it('should track multiple requests from same client', () => {
      const clientId = 'test-client-2';
      const maxRequests = VIDEO_GENERATION_RATE_LIMIT.maxRequests;
      
      // Make requests up to the limit
      for (let i = 0; i < maxRequests; i++) {
        const result = checkRateLimit(clientId, VIDEO_GENERATION_RATE_LIMIT);
        expect(result.isLimited).toBe(false);
      }
      
      // Next request should be limited
      const result = checkRateLimit(clientId, VIDEO_GENERATION_RATE_LIMIT);
      expect(result.isLimited).toBe(true);
      expect(result.remaining).toBe(0);
    });

    it('should allow different clients independently', () => {
      const client1 = 'client-1';
      const client2 = 'client-2';
      const maxRequests = VIDEO_GENERATION_RATE_LIMIT.maxRequests;
      
      // Exhaust client1's limit
      for (let i = 0; i < maxRequests; i++) {
        checkRateLimit(client1, VIDEO_GENERATION_RATE_LIMIT);
      }
      
      // Client2 should still have full limit
      const result = checkRateLimit(client2, VIDEO_GENERATION_RATE_LIMIT);
      expect(result.isLimited).toBe(false);
      expect(result.remaining).toBe(maxRequests - 1);
    });

    it('should use different configs for different endpoints', () => {
      const clientId = 'test-client';
      
      // Exhaust video generation limit
      for (let i = 0; i < VIDEO_GENERATION_RATE_LIMIT.maxRequests; i++) {
        checkRateLimit(clientId, VIDEO_GENERATION_RATE_LIMIT);
      }
      
      // Video generation should be limited
      expect(checkRateLimit(clientId, VIDEO_GENERATION_RATE_LIMIT).isLimited).toBe(true);
      
      // Screenshot should still work
      expect(checkRateLimit(clientId, SCREENSHOT_RATE_LIMIT).isLimited).toBe(false);
    });

    it('should reset after window expires', async () => {
      const clientId = 'test-client-reset';
      const shortWindowConfig = { windowMs: 100, maxRequests: 2 };
      
      // Use up the limit
      checkRateLimit(clientId, shortWindowConfig);
      checkRateLimit(clientId, shortWindowConfig);
      expect(checkRateLimit(clientId, shortWindowConfig).isLimited).toBe(true);
      
      // Wait for window to expire
      await new Promise((resolve) => setTimeout(resolve, 150));
      
      // Should be reset
      const result = checkRateLimit(clientId, shortWindowConfig);
      expect(result.isLimited).toBe(false);
      expect(result.remaining).toBe(1);
    });
  });

  describe('getClientId', () => {
    it('should extract IP from x-forwarded-for header', () => {
      const request = new Request('http://localhost', {
        headers: { 'x-forwarded-for': '192.168.1.1, 10.0.0.1' },
      });
      
      const clientId = getClientId(request);
      expect(clientId).toBe('ip:192.168.1.1');
    });

    it('should extract IP from x-real-ip header', () => {
      const request = new Request('http://localhost', {
        headers: { 'x-real-ip': '192.168.1.2' },
      });
      
      const clientId = getClientId(request);
      expect(clientId).toBe('ip:192.168.1.2');
    });

    it('should extract IP from cf-connecting-ip header', () => {
      const request = new Request('http://localhost', {
        headers: { 'cf-connecting-ip': '192.168.1.3' },
      });
      
      const clientId = getClientId(request);
      expect(clientId).toBe('ip:192.168.1.3');
    });

    it('should prioritize x-forwarded-for over other headers', () => {
      const request = new Request('http://localhost', {
        headers: {
          'x-forwarded-for': '192.168.1.1',
          'x-real-ip': '192.168.1.2',
          'cf-connecting-ip': '192.168.1.3',
        },
      });
      
      const clientId = getClientId(request);
      expect(clientId).toBe('ip:192.168.1.1');
    });

    it('should return unknown for missing headers', () => {
      const request = new Request('http://localhost');
      
      const clientId = getClientId(request);
      expect(clientId).toBe('ip:unknown');
    });
  });

  describe('resetRateLimit', () => {
    it('should reset rate limit for specific client', () => {
      const clientId = 'client-to-reset';
      const maxRequests = VIDEO_GENERATION_RATE_LIMIT.maxRequests;
      
      // Exhaust limit
      for (let i = 0; i < maxRequests; i++) {
        checkRateLimit(clientId, VIDEO_GENERATION_RATE_LIMIT);
      }
      expect(checkRateLimit(clientId, VIDEO_GENERATION_RATE_LIMIT).isLimited).toBe(true);
      
      // Reset
      resetRateLimit(clientId);
      
      // Should be able to make requests again
      const result = checkRateLimit(clientId, VIDEO_GENERATION_RATE_LIMIT);
      expect(result.isLimited).toBe(false);
      expect(result.remaining).toBe(maxRequests - 1);
    });
  });

  describe('clearAllRateLimits', () => {
    it('should clear all rate limits', () => {
      const client1 = 'client-1';
      const client2 = 'client-2';
      const maxRequests = VIDEO_GENERATION_RATE_LIMIT.maxRequests;
      
      // Exhaust both clients
      for (let i = 0; i < maxRequests; i++) {
        checkRateLimit(client1, VIDEO_GENERATION_RATE_LIMIT);
        checkRateLimit(client2, VIDEO_GENERATION_RATE_LIMIT);
      }
      
      // Clear all
      clearAllRateLimits();
      
      // Both should be reset
      expect(checkRateLimit(client1, VIDEO_GENERATION_RATE_LIMIT).isLimited).toBe(false);
      expect(checkRateLimit(client2, VIDEO_GENERATION_RATE_LIMIT).isLimited).toBe(false);
    });
  });

  describe('Rate limit configurations', () => {
    it('should have correct video generation limits', () => {
      expect(VIDEO_GENERATION_RATE_LIMIT.windowMs).toBe(60 * 1000);
      expect(VIDEO_GENERATION_RATE_LIMIT.maxRequests).toBe(5);
    });

    it('should have correct screenshot limits', () => {
      expect(SCREENSHOT_RATE_LIMIT.windowMs).toBe(60 * 1000);
      expect(SCREENSHOT_RATE_LIMIT.maxRequests).toBe(30);
    });
  });
});
