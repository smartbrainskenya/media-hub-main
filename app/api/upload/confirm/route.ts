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

    const type: MediaType = (publitio_response.type === 'video' || publitio_response.extension === 'mp4') ? 'video' : 'image';
    const publitioPath = publitio_response.url_preview || publitio_response.url_short || publitio_response.path || '';
    
    if (!publitioPath) {
      console.error('[API_UPLOAD_CONFIRM] No URL or path in Publitio response:', publitio_response);
      return NextResponse.json({ data: null, error: 'Incomplete response from media server' }, { status: 400 });
    }

    const branded_url = buildBrandedUrl(publitioPath);

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

    if (error || !asset) {
      console.error('[API_UPLOAD_CONFIRM] Supabase insert failed:', error);
      return NextResponse.json({ data: null, error: 'Failed to record asset in database' }, { status: 500 });
    }

    // Log action
    await db.from('audit_log').insert([
      {
        admin_id: session.user.id,
        action: 'upload',
        media_id: asset.id,
        metadata: { title: asset.title },
      },
    ]);

    const { publitio_id: _, ...sanitizedAsset } = asset as any;
    return NextResponse.json({ data: sanitizedAsset, error: null });
  } catch (error: any) {
    console.error('[API_UPLOAD_CONFIRM_POST] Error:', error);
    return NextResponse.json({ data: null, error: error.message || 'Failed to confirm upload' }, { status: 500 });
  }
}
