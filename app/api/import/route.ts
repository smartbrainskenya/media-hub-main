import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth';
import { publitio, buildBrandedUrl } from '@/lib/publitio';
import { ImportMediaSchema } from '@/lib/validations';
import { MediaType, MediaAsset, SanitizedMediaAsset } from '@/types';
import { DEFAULT_CATEGORY_SLUG } from '@/lib/categories';

import { importLimiter } from '@/lib/rate-limit';

/**
 * POST /api/import
 * Protected endpoint to import media from a URL using Publitio SDK
 * Includes retry logic for transient failures
 */
interface PublitioResponse {
  id: string;
  code: number;
  message?: string;
  type: string;
  extension: string;
  url_preview?: string;
  url_short?: string;
  path?: string;
  size?: number;
  width?: number;
  height?: number;
  duration?: number;
}

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ data: null, error: 'Unauthorized' }, { status: 401 });
    }

    // Rate limiting
    if (importLimiter) {
      const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || '127.0.0.1';
      const { success } = await importLimiter.limit(ip);
      if (!success) {
        return NextResponse.json({
          data: null,
          error: 'Too many requests. Please try again later.'
        }, { status: 429 });
      }
    } else if (process.env.NODE_ENV === 'production') {
      return NextResponse.json({
        data: null,
        error: 'System configuration error: Rate limiting is required in production'
      }, { status: 503 });
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

    // Basic SSRF Protection
    try {
      const parsedUrl = new URL(url);
      const hostname = parsedUrl.hostname.toLowerCase();
      // Block common local/private IP ranges and hostnames
      const privateNetRegex = /^(localhost|127\.|192\.168\.|10\.|172\.(1[6-9]|2[0-9]|3[0-1])\.)/;
      if (hostname === 'localhost' || hostname.endsWith('.local') || privateNetRegex.test(hostname)) {
        return NextResponse.json({ data: null, error: 'Local or private network URLs are not allowed.' }, { status: 400 });
      }
    } catch {
      return NextResponse.json({ data: null, error: 'Invalid URL format.' }, { status: 400 });
    }

    // Import from URL with retry logic
    let publitio_response: PublitioResponse | null = null;
    let lastError: unknown = null;

    console.log('[API_IMPORT] Starting import from URL:', { url, title });

    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        console.log(`[API_IMPORT] Attempt ${attempt}/3 - importing from external URL`);
        
        publitio_response = (await publitio.call('/files/create', 'POST', {
          file_url: url,
          title: title,
        })) as PublitioResponse;

        if (publitio_response && publitio_response.code < 400 && publitio_response.id) {
          console.log('[API_IMPORT] Import success on attempt', attempt, {
            id: publitio_response.id,
            type: publitio_response.type,
          });
          break;
        } else {
          lastError = new Error(publitio_response?.message || `HTTP ${publitio_response?.code}`);
          console.warn(`[API_IMPORT] Attempt ${attempt} failed:`, (lastError as Error).message);
          
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
      const errorMsg = publitio_response?.message || (lastError instanceof Error ? lastError.message : String(lastError)) || 'Import failed after 3 attempts';
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
          category_slug: DEFAULT_CATEGORY_SLUG,
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
        metadata: {
          title: asset.title,
          source_url: url,
          category_slug: asset.category_slug || DEFAULT_CATEGORY_SLUG,
        },
      },
    ]);

    const duration = Date.now() - startTime;
    console.log('[API_IMPORT] Success in', duration, 'ms:', {
      assetId: asset.id,
      title: asset.title,
      type: asset.type,
    });

    const { publitio_id: _, ...sanitizedAsset } = asset as MediaAsset;
    return NextResponse.json({ data: sanitizedAsset as SanitizedMediaAsset, error: null });
  } catch (error) {
    const err = error as Error;
    console.error('[API_IMPORT_POST] Unexpected error:', err);
    return NextResponse.json(
      { data: null, error: err.message || 'Unexpected error during import' },
      { status: 500 }
    );
  }
}
