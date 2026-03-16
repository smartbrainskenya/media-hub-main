import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth';
import { publitio, buildBrandedUrl } from '@/lib/publitio';
import { ImportMediaSchema } from '@/lib/validations';
import { MediaType } from '@/types';

/**
 * POST /api/import
 * Protected endpoint to import media from a URL using Publitio SDK
 * Includes retry logic for transient failures
 */
export async function POST(req: NextRequest) {
  const startTime = Date.now();
  
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

    if (!db || !publitio) {
      console.error('[API_IMPORT] Client not initialized', { db: !!db, publitio: !!publitio });
      return NextResponse.json({ data: null, error: 'System configuration error' }, { status: 500 });
    }

    const { url, title } = parsed.data;

    // Import from URL with retry logic
    let publitio_response: any = null;
    let lastError: any = null;

    console.log('[API_IMPORT] Starting import from URL:', { url, title });

    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        console.log(`[API_IMPORT] Attempt ${attempt}/3 - importing from external URL`);
        
        // @ts-ignore (SDK types are limited)
        publitio_response = await publitio.call('/files/create', 'POST', {
          file_url: url,
          title: title,
        });

        if (publitio_response && publitio_response.code < 400 && publitio_response.id) {
          console.log('[API_IMPORT] Import success on attempt', attempt, {
            id: publitio_response.id,
            type: publitio_response.type,
          });
          break;
        } else {
          lastError = new Error(publitio_response?.message || `HTTP ${publitio_response?.code}`);
          console.warn(`[API_IMPORT] Attempt ${attempt} failed:`, lastError.message);
          
          if (attempt < 3) {
            // Exponential backoff: 1s, 2s
            await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
          }
        }
      } catch (err) {
        lastError = err;
        console.error(`[API_IMPORT] Attempt ${attempt} error:`, err);
        
        if (attempt < 3) {
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        }
      }
    }

    // Check if import succeeded
    if (!publitio_response || publitio_response.code >= 400 || !publitio_response.id) {
      const errorMsg = publitio_response?.message || lastError?.message || 'Import failed after 3 attempts';
      console.error('[API_IMPORT] Failed to import:', errorMsg);
      return NextResponse.json(
        { 
          data: null, 
          error: `Import failed: ${errorMsg}. Please verify the URL is accessible and contains a valid image or video file.`
        },
        { status: publitio_response?.code || 502 }
      );
    }

    const type: MediaType = (publitio_response.type === 'video' || publitio_response.extension === 'mp4') ? 'video' : 'image';
    
    // Publitio returns different URL fields depending on configuration
    const publitioPath = publitio_response.url_preview || publitio_response.url_short || publitio_response.path || '';
    if (!publitioPath) {
      console.error('[API_IMPORT] No URL or path in Publitio response:', publitio_response);
      return NextResponse.json({ data: null, error: 'Incomplete response from media server' }, { status: 502 });
    }

    const branded_url = buildBrandedUrl(publitioPath);

    console.log('[API_IMPORT] Inserting into database:', {
      publitio_id: publitio_response.id,
      title,
      type,
      uploaded_by: session.user.id,
    });

    const { data: asset, error } = await db
      .from('media_assets')
      .insert([
        {
          publitio_id: publitio_response.id,
          title: title.trim(),
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
      console.error('[API_IMPORT] Database insert failed:', error);
      return NextResponse.json({ data: null, error: 'Failed to record asset in database' }, { status: 500 });
    }

    // Log audit trail
    await db.from('audit_log').insert([
      {
        admin_id: session.user.id,
        action: 'import',
        media_id: asset.id,
        metadata: { title: asset.title, source_url: url },
      },
    ]);

    const duration = Date.now() - startTime;
    console.log('[API_IMPORT] Success in', duration, 'ms:', {
      assetId: asset.id,
      title: asset.title,
      type: asset.type,
    });

    const { publitio_id: _, ...sanitizedAsset } = asset;
    return NextResponse.json({ data: sanitizedAsset, error: null });
  } catch (error: any) {
    console.error('[API_IMPORT_POST] Unexpected error:', error);
    if (error.stack) console.error(error.stack);
    return NextResponse.json(
      { data: null, error: error.message || 'Unexpected error during import' },
      { status: 500 }
    );
  }
}
