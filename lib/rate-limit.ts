import 'server-only';
import { db } from '@/lib/db';

async function checkRateLimit(
  key: string,
  limit: number,
  windowSeconds: number,
): Promise<{ success: boolean }> {
  if (!db) {
    return { success: process.env.NODE_ENV !== 'production' };
  }

  const window = Math.floor(Date.now() / 1000 / windowSeconds);

  const { data, error } = await db.rpc('increment_rate_limit', {
    p_key: key,
    p_window: window,
    p_limit: limit,
  });

  if (error) {
    console.error('[RATE_LIMIT]', error.message);
    return { success: true }; // fail open — don't block users on DB hiccups
  }

  return { success: data === true };
}

// 5 uploads per hour — keyed by authenticated user ID
export const uploadLimiter = {
  limit: (userId: string) => checkRateLimit(`upload:${userId}`, 5, 3600),
};

// 10 imports per hour — keyed by authenticated user ID
export const importLimiter = {
  limit: (userId: string) => checkRateLimit(`import:${userId}`, 10, 3600),
};

// 10 login attempts per 15 minutes — keyed by IP
export const authLimiter = {
  limit: (ip: string) => checkRateLimit(`auth:${ip}`, 10, 900),
};

// 50 media requests per hour — keyed by IP.
// Limit is intentionally high: many students share a single school NAT IP.
export const assetRequestLimiter = {
  limit: (ip: string) => checkRateLimit(`request:${ip}`, 50, 3600),
};
