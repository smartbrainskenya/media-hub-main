import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth';
import { CreateMediaSchema } from '@/lib/validations';
import { ApiResponse, PaginatedResponse, MediaAsset } from '@/types';

/**
 * GET /api/media
 * Public endpoint to list media assets
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type') as 'image' | 'video' | null;
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const perPage = Math.min(48, Math.max(1, parseInt(searchParams.get('per_page') || '24')));

    let query = db
      .from('media_assets')
      .select('*', { count: 'exact' });

    if (type) {
      query = query.eq('type', type);
    }

    const { data, count, error } = await query
      .order('created_at', { ascending: false })
      .range((page - 1) * perPage, page * perPage - 1);

    if (error) throw error;

    // Sanitize response: remove publitio_id
    const sanitizedData = (data || []).map((item: any) => {
      const { publitio_id, ...rest } = item;
      return rest;
    }) as MediaAsset[];

    const response: PaginatedResponse<MediaAsset> = {
      data: sanitizedData,
      total: count || 0,
      page,
      per_page: perPage,
    };

    return NextResponse.json(response);
  } catch (error: any) {
    console.error('[API_MEDIA_GET]', error);
    return NextResponse.json({ data: null, error: 'Failed to fetch media' }, { status: 500 });
  }
}

/**
 * POST /api/media
 * Protected endpoint to create a media record manually
 */
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ data: null, error: 'Unauthorized' }, { status: 401 });
    }

    const json = await req.json();
    const parsed = CreateMediaSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json({ data: null, error: parsed.error.message }, { status: 400 });
    }

    const { data: asset, error } = await db
      .from('media_assets')
      .insert([
        {
          ...parsed.data,
          uploaded_by: session.user.id,
        },
      ])
      .select()
      .single();

    if (error) throw error;

    // Log action
    await db.from('audit_log').insert([
      {
        admin_id: session.user.id,
        action: 'upload',
        media_id: asset.id,
        metadata: { title: asset.title },
      },
    ]);

    const { publitio_id, ...sanitizedAsset } = asset;
    return NextResponse.json({ data: sanitizedAsset, error: null }, { status: 201 });
  } catch (error: any) {
    console.error('[API_MEDIA_POST]', error);
    return NextResponse.json({ data: null, error: 'Failed to create media' }, { status: 500 });
  }
}
