/**
 * Rate Limiter - In-memory sliding window rate limiter
 * 
 * Simple implementation for single-instance deployments.
 * For multi-instance deployments, use Redis or Upstash.
 */

interface RateLimitEntry {
  timestamps: number[];
  resetAt: number;
}

interface RateLimitConfig {
  windowMs: number;      // Time window in milliseconds
  maxRequests: number;    // Max requests per window
}

/**
 * Default rate limit for video generation (expensive operation)
 */
export const VIDEO_GENERATION_RATE_LIMIT: RateLimitConfig = {
  windowMs: 60 * 1000,   // 1 minute
  maxRequests: 5,          // 5 requests per minute
};

/**
 * Default rate limit for screenshots (cheaper operation)
 */
export const SCREENSHOT_RATE_LIMIT: RateLimitConfig = {
  windowMs: 60 * 1000,   // 1 minute
  maxRequests: 30,         // 30 requests per minute
};

// In-memory store (per instance)
const rateLimitStore = new Map<string, RateLimitEntry>();

/**
 * Clean up expired entries periodically
 */
const CLEANUP_INTERVAL = 60 * 1000; // 1 minute

let cleanupTimer: NodeJS.Timeout | null = null;

function startCleanup(): void {
  if (cleanupTimer) return;
  
  cleanupTimer = setInterval(() => {
    const now = Date.now();
    const entries = Array.from(rateLimitStore.entries());
    for (const [key, entry] of entries) {
      // Remove entries that have expired
      if (entry.resetAt < now) {
        rateLimitStore.delete(key);
      }
    }
  }, CLEANUP_INTERVAL);
  
  // Don't prevent process exit
  cleanupTimer.unref();
}

// Start cleanup on first use
startCleanup();

/**
 * Check if a request should be rate limited
 * @param clientId - Unique identifier (IP, user ID, API key, etc.)
 * @param config - Rate limit configuration
 * @returns Rate limit result with remaining requests and reset time
 */
export function checkRateLimit(
  clientId: string,
  config: RateLimitConfig = VIDEO_GENERATION_RATE_LIMIT
): RateLimitResult {
  const now = Date.now();
  const windowStart = now - config.windowMs;
  
  let entry = rateLimitStore.get(clientId);
  
  // Initialize or reset entry if window has expired
  if (!entry || entry.resetAt < now) {
    entry = {
      timestamps: [],
      resetAt: now + config.windowMs,
    };
    rateLimitStore.set(clientId, entry);
  }
  
  // Remove timestamps outside the window
  entry.timestamps = entry.timestamps.filter((ts) => ts > windowStart);
  
  // Check if limit exceeded
  const isLimited = entry.timestamps.length >= config.maxRequests;
  
  if (!isLimited) {
    // Add current timestamp
    entry.timestamps.push(now);
  }
  
  return {
    isLimited,
    remaining: Math.max(0, config.maxRequests - entry.timestamps.length),
    resetAt: entry.resetAt,
    total: config.maxRequests,
  };
}

export interface RateLimitResult {
  isLimited: boolean;
  remaining: number;
  resetAt: number;
  total: number;
}

/**
 * Get client identifier from request
 * Uses X-Forwarded-For header if behind a proxy, otherwise falls back to IP
 */
export function getClientId(request: Request): string {
  // Check various headers for client identification
  const forwardedFor = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const cfConnectingIp = request.headers.get('cf-connecting-ip');
  
  // Use first IP if forwarded
  const ip = forwardedFor?.split(',')[0]?.trim() 
    || realIp 
    || cfConnectingIp 
    || 'unknown';
  
  return `ip:${ip}`;
}

/**
 * Reset rate limit for a specific client (for testing/admin)
 */
export function resetRateLimit(clientId: string): void {
  rateLimitStore.delete(clientId);
}

/**
 * Clear all rate limits (for testing)
 */
export function clearAllRateLimits(): void {
  rateLimitStore.clear();
}
