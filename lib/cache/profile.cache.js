// lib/cache/profile.cache.js
//
// Redis-backed UserProfile cache layer.
//
// Design rules:
//   • Redis is a SPEED layer only — never a source of truth.
//   • Every operation is wrapped in try/catch with silent fallback.
//   • If Redis is down, throttled, or unconfigured, all functions return
//     null / void and callers fall through to MongoDB. Zero crashes.
//   • Invalidate on every write — never serve stale profile data.
//   • TTL = 5 minutes. Short enough that subscription/onboarding state
//     changes reflect quickly without a manual refresh.
//
// Security:
//   • Cache key is firebaseUID only — never email (changeable).
//   • Keys are prefixed + versioned so a schema change busts old cache
//     by bumping CACHE_VERSION without touching Redis manually.
//   • Never log profile data — only warn on Redis errors.

import { redis } from "@/lib/security/rateLimiter";

const CACHE_VERSION = "v1";
const PREFIX = `profile:${CACHE_VERSION}:`;
const TTL_SECONDS = 300; // 5 minutes

/**
 * Build the Redis key for a given firebaseUID.
 * @param {string} firebaseUID
 * @returns {string}
 */
function key(firebaseUID) {
  return `${PREFIX}${firebaseUID}`;
}

/**
 * Get a cached UserProfile from Redis.
 *
 * Returns the cached plain object, or null on cache miss / Redis error.
 * Callers must always handle null by fetching from MongoDB.
 *
 * @param {string} firebaseUID
 * @returns {Promise<object|null>}
 */
export async function getCachedProfile(firebaseUID) {
  if (!redis || !firebaseUID) return null;
  try {
    return await redis.get(key(firebaseUID));
  } catch (err) {
    console.warn("[ProfileCache] get failed — falling back to DB:", err.message);
    return null;
  }
}

/**
 * Store a UserProfile in Redis with a 5-minute TTL.
 *
 * Silent fail — a cache write failure never breaks the request.
 * Only call with lean() plain objects, never Mongoose documents.
 *
 * @param {string} firebaseUID
 * @param {object} profile  — lean() plain JS object from MongoDB
 * @returns {Promise<void>}
 */
export async function setCachedProfile(firebaseUID, profile) {
  if (!redis || !firebaseUID || !profile) return;
  try {
    await redis.setex(key(firebaseUID), TTL_SECONDS, profile);
  } catch (err) {
    console.warn("[ProfileCache] set failed — cache miss on next request:", err.message);
  }
}

/**
 * Delete a cached UserProfile from Redis.
 *
 * Call this immediately after any UserProfile write (update, create, heal).
 * The next read will be a cache miss and re-fetch fresh data from MongoDB.
 *
 * Silent fail — invalidation failure degrades to slightly stale cache
 * for up to TTL_SECONDS, which is acceptable.
 *
 * @param {string} firebaseUID
 * @returns {Promise<void>}
 */
export async function invalidateCachedProfile(firebaseUID) {
  if (!redis || !firebaseUID) return;
  try {
    await redis.del(key(firebaseUID));
  } catch (err) {
    console.warn("[ProfileCache] invalidate failed — stale cache may persist up to 5 min:", err.message);
  }
}
