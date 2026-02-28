import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth';
import { publitio, buildBrandedUrl } from '@/lib/publitio';
import { ImportMediaSchema } from '@/lib/validations';
import { MediaType } from '@/types';

/**
 * POST /api/import
 * Protected endpoint to import media from a URL
 * Reliable for files under ~100MB within 60s Vercel timeout
 */
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ data: null, error: 'Unauthorized' }, { status: 401 });
    }

    const json = await req.json();
    const parsed = ImportMediaSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json({ data: null, error: parsed.error.message }, { status: 400 });
    }

    const { url, title } = parsed.data;

    // Call Publitio to import from URL
    // @ts-ignore
    const publitio_response = await publitio.call('/files/create', 'POST', {
      file_url: url,
      title: title,
    });

    if (publitio_response.code >= 400) {
      return NextResponse.json({ data: null, error: publitio_response.message || 'Failed to import from URL' }, { status: publitio_response.code });
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
        action: 'import',
        media_id: asset.id,
        metadata: { title: asset.title, source_url: url },
      },
    ]);

    const { publitio_id, ...sanitizedAsset } = asset;
    return NextResponse.json({ data: sanitizedAsset, error: null });
  } catch (error: any) {
    console.error('[API_IMPORT_POST]', error);
    return NextResponse.json({ data: null, error: 'Failed to import media' }, { status: 500 });
  }
}
