import 'server-only';
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Only initialize if environment variables are present
const redis = (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN)
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })
  : null;

/**
 * Rate limiting utilities for sensitive API routes
 * - Uses Upstash Redis as global persistent store
 * - Falls back to allowing requests if Redis is not configured (e.g. during dev)
 */

// 5 requests per hour for signed uploads
export const uploadLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(5, "1 h"),
      analytics: true,
      prefix: "media_hub:upload",
    })
  : null;

// 10 requests per hour for imports
export const importLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(10, "1 h"),
      analytics: true,
      prefix: "media_hub:import",
    })
  : null;

// 10 requests per 15 mins for auth attempts
export const authLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(10, "15 m"),
      analytics: true,
      prefix: "media_hub:auth",
    })
  : null;
