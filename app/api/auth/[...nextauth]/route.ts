import { handlers } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { authLimiter } from "@/lib/rate-limit";

const { GET: authGET, POST: authPOST } = handlers;

/**
 * POST /api/auth/[...nextauth]
 * Wrapped to include rate limiting on authentication attempts
 */
export async function POST(req: NextRequest) {
  // Only rate limit credentials login attempts if limiter is configured
  if (authLimiter) {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || '127.0.0.1';
    const { success } = await authLimiter.limit(ip);
    
    if (!success) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }
  }
  
  return authPOST(req);
}

export async function GET(req: NextRequest) {
  return authGET(req);
}
