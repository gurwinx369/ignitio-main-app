import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Check if Upstash env variables exist, otherwise fallback or mock
const isRedisConfigured =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN;

export const redis = isRedisConfigured
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })
  : null;

// Helper to get client IP for anonymous routes (like payment verifications or if token fails)
export function getClientIp(request) {
  const headers = request.headers;
  let ip =
    request.ip ??
    headers?.get("x-real-ip") ??
    headers?.get("cf-connecting-ip") ??
    headers?.get("x-forwarded-for");

  if (ip && typeof ip === "string") {
    if (ip.includes(",")) {
      ip = ip.split(",")[0].trim();
    }
    // Bound IP length to max 45 chars (standard IPv6 with port length) to prevent memory spoofing
    const cleanIp = ip.trim().slice(0, 45);
    if (cleanIp) return cleanIp;
  }
  return "127.0.0.1";
}

// In-memory sliding window fallback store for development or when Redis is absent/down
// Capped at MAX_STORE_SIZE with automatic stale key eviction to prevent memory leaks
const inMemoryFallbackStore = new Map();
const MAX_STORE_SIZE = 5000;

export function checkInMemoryLimit(identifier, maxRequests, windowMs) {
  const now = Date.now();
  let timestamps = inMemoryFallbackStore.get(identifier);

  if (timestamps) {
    timestamps = timestamps.filter((t) => now - t < windowMs);
  } else {
    timestamps = [];
  }

  // Evict empty/expired keys to prevent heap leaks
  if (timestamps.length === 0 && inMemoryFallbackStore.has(identifier)) {
    inMemoryFallbackStore.delete(identifier);
  }

  if (timestamps.length >= maxRequests) {
    inMemoryFallbackStore.set(identifier, timestamps);
    return false;
  }

  // Capacity protection against distributed memory exhaustion attacks
  if (inMemoryFallbackStore.size >= MAX_STORE_SIZE && !inMemoryFallbackStore.has(identifier)) {
    for (const [key, val] of inMemoryFallbackStore.entries()) {
      if (val.every((t) => now - t >= windowMs)) {
        inMemoryFallbackStore.delete(key);
      }
    }
    if (inMemoryFallbackStore.size >= MAX_STORE_SIZE) {
      const oldestKey = inMemoryFallbackStore.keys().next().value;
      if (oldestKey) inMemoryFallbackStore.delete(oldestKey);
    }
  }

  timestamps.push(now);
  inMemoryFallbackStore.set(identifier, timestamps);
  return true;
}

export function getFallbackStoreSize() {
  return inMemoryFallbackStore.size;
}

// 1. AI Generation Routes (Kyle): 5 requests per minute
export const aiRateLimiter = isRedisConfigured
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(5, "1 m"),
      analytics: false,
    })
  : { limit: async (id) => ({ success: checkInMemoryLimit(`ai:${id}`, 5, 60000) }) };

// 2. Sensitive Routes (Payment, Auth): 10 requests per minute
export const sensitiveRateLimiter = isRedisConfigured
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(10, "1 m"),
      analytics: false,
    })
  : { limit: async (id) => ({ success: checkInMemoryLimit(`sensitive:${id}`, 10, 60000) }) };

// 3. Feedback / Notifications / Compiler: 5 requests per minute
export const spamRateLimiter = isRedisConfigured
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(5, "1 m"),
      analytics: false,
    })
  : { limit: async (id) => ({ success: checkInMemoryLimit(`spam:${id}`, 5, 60000) }) };

/**
 * Common usage helper to cleanly enforce rate limits in routes.
 * Returns an error Response if rate limited, otherwise null.
 */
export async function enforceRateLimit(limiter, identifier) {
  try {
    const { success } = await limiter.limit(identifier);
    if (!success) {
      return new Response(
        JSON.stringify({
          message: "Too Many Requests",
          error: "Rate limit exceeded. Please try again later.",
        }),
        { status: 429, headers: { "Content-Type": "application/json" } }
      );
    }
  } catch (err) {
    // If Redis call throws, fall back to in-memory check instead of silently failing open
    console.error("[RateLimiter] Redis error, falling back to local memory:", err.message);
    const fallbackOk = checkInMemoryLimit(`err:${identifier}`, 10, 60000);
    if (!fallbackOk) {
      return new Response(
        JSON.stringify({
          message: "Too Many Requests",
          error: "Rate limit exceeded. Please try again later.",
        }),
        { status: 429, headers: { "Content-Type": "application/json" } }
      );
    }
  }
  return null;
}
