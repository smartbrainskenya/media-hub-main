import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { assetRequestLimiter } from '@/lib/rate-limit';
import { CreateAssetRequestSchema } from '@/lib/validations';
import { ApiResponse, AssetRequest } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || '127.0.0.1';
    const { success } = await assetRequestLimiter.limit(ip);

    if (!success) {
      return NextResponse.json(
        { data: null, error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }

    if (!db) {
      return NextResponse.json({ data: null, error: 'Database not initialized' }, { status: 500 });
    }

    const json = await req.json();
    const parsed = CreateAssetRequestSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json({ data: null, error: parsed.error.issues[0]?.message || parsed.error.message }, { status: 400 });
    }

    const payload = {
      query: parsed.data.query.trim(),
      type: parsed.data.type,
      context: parsed.data.context,
      note: parsed.data.note?.trim() || null,
      status: 'pending' as const,
    };

    const { data, error } = await db
      .from('asset_requests')
      .insert([payload])
      .select('*')
      .single();

    if (error || !data) {
      console.error('[API_REQUESTS_POST]', error);
      return NextResponse.json({ data: null, error: 'Failed to submit request' }, { status: 500 });
    }

    return NextResponse.json({ data: data as AssetRequest, error: null } as ApiResponse<AssetRequest>, { status: 201 });
  } catch (error) {
    console.error('[API_REQUESTS_POST]', error);
    return NextResponse.json({ data: null, error: 'Failed to submit request' }, { status: 500 });
  }
}
