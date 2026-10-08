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
  let ip = request.ip ?? request.headers.get("x-forwarded-for");
  if (ip && ip.includes(",")) {
    ip = ip.split(",")[0].trim();
  }
  return ip || "127.0.0.1";
}

// 1. AI Generation Routes (Kyle): 5 requests per minute
export const aiRateLimiter = isRedisConfigured
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(5, "1 m"),
      analytics: false,
    })
  : { limit: async () => ({ success: true }) }; // mock if not configured

// 2. Sensitive Routes (Payment, Auth): 10 requests per minute
export const sensitiveRateLimiter = isRedisConfigured
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(10, "1 m"),
      analytics: false,
    })
  : { limit: async () => ({ success: true }) };

// 3. Feedback / Notifications: 5 requests per minute
export const spamRateLimiter = isRedisConfigured
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(5, "1 m"),
      analytics: false,
    })
  : { limit: async () => ({ success: true }) };

/**
 * Common usage helper to cleanly enforce rate limits in routes.
 * Returns an error Response if rate limited, otherwise null.
 */
export async function enforceRateLimit(limiter, identifier) {
  if (!isRedisConfigured) return null;

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
    // If Redis fails, log it but let the request pass through (fail open)
    console.error("[RateLimiter] Error:", err.message);
  }
  return null;
}
