import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth';
import { buildBrandedUrl } from '@/lib/publitio';
import { MediaType } from '@/types';

/**
 * POST /api/upload/confirm
 * Protected endpoint to confirm successful upload and write to DB
 */
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ data: null, error: 'Unauthorized' }, { status: 401 });
    }

    const json = await req.json();
    const { publitio_response, title } = json;

    if (!publitio_response?.id || !title) {
      return NextResponse.json({ data: null, error: 'Missing required data' }, { status: 400 });
    }

    const type: MediaType = publitio_response.type === 'video' ? 'video' : 'image';
    const branded_url = buildBrandedUrl(publitio_response.url_preview || publitio_response.url_short);

    const { data: asset, error } = await db
      .from('media_assets')
      .insert([
        {
          publitio_id: publitio_response.id,
          title: title,
          type: type,
          branded_url: branded_url,
          file_size_bytes: publitio_response.size,
          width_px: publitio_response.width,
          height_px: publitio_response.height,
          duration_secs: publitio_response.duration ? Math.round(publitio_response.duration) : null,
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
    return NextResponse.json({ data: sanitizedAsset, error: null });
  } catch (error: any) {
    console.error('[API_UPLOAD_CONFIRM_POST]', error);
    return NextResponse.json({ data: null, error: 'Failed to confirm upload' }, { status: 500 });
  }
}
