import { NextRequest, NextResponse } from 'next/server';
import { createHash } from 'crypto';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth';
import { buildBrandedUrl } from '@/lib/publitio';
import { MediaType } from '@/types';

/**
 * Generate Publitio API auth signature
 * Signature = SHA1(api_timestamp + api_nonce + api_secret)
 * Order matters! Timestamp and nonce must come BEFORE secret.
 */
function buildPublitioAuthParams() {
  const apiSecret = process.env.PUBLITIO_API_SECRET!;
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const nonce = Math.floor(Math.random() * 90000000 + 10000000).toString();
  
  // CRITICAL: Order is timestamp + nonce + secret
  const signature = createHash('sha1')
    .update(timestamp + nonce + apiSecret)
    .digest('hex');
  
  return {
    api_key: process.env.PUBLITIO_API_KEY!,
    api_timestamp: timestamp,
    api_nonce: nonce,
    api_signature: signature,
  };
}

/**
 * POST /api/upload
 * Protected endpoint to upload media using Publitio SDK
 * 
 * Accepts FormData with:
 *   - file: File blob
 *   - title: string (display name)
 * 
 * Returns: { data: MediaAsset, error: null }
 */
export async function POST(req: NextRequest) {
  const startTime = Date.now();
  
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ data: null, error: 'Unauthorized' }, { status: 401 });
    }

    // Parse multipart form data
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const title = formData.get('title') as string | null;

    if (!file) {
      return NextResponse.json({ data: null, error: 'Missing file' }, { status: 400 });
    }

    if (!title || title.trim().length === 0) {
      return NextResponse.json({ data: null, error: 'Missing title' }, { status: 400 });
    }

    // Validate file type
    const isImage = file.type.startsWith('image/');
    const isVideo = file.type.startsWith('video/');
    if (!isImage && !isVideo) {
      return NextResponse.json({ data: null, error: 'Only images and videos are allowed' }, { status: 400 });
    }

    // 500MB limit
    if (file.size > 500 * 1024 * 1024) {
      return NextResponse.json({ data: null, error: 'File size exceeds 500MB limit' }, { status: 400 });
    }

    console.log('[API_UPLOAD] Starting upload:', {
      filename: file.name,
      fileSize: file.size,
      fileType: file.type,
      title,
      userId: session.user.id,
    });

    // Convert File to Buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // Upload to Publitio with retry logic
    let publitio_response: any = null;
    let lastError: any = null;

    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        console.log(`[API_UPLOAD] Attempt ${attempt}/3 - uploading to Publitio`);
        
        // Build Publitio auth params (HMAC-SHA1 signature)
        // Auth params go in URL query string, file goes in body
        const authParams = buildPublitioAuthParams();
        const uploadUrl = new URL('https://api.publit.io/v1/files/create');
        
        // Append auth params to URL (NOT the file!)
        Object.entries(authParams).forEach(([k, v]) => {
          uploadUrl.searchParams.set(k, v);
        });

        // Build FormData with file in body
        const uploadFormData = new FormData();
        uploadFormData.append(
          'file',
          new Blob([buffer], { type: file.type }),
          file.name
        );
        uploadFormData.append('title', title);

        // POST to Publitio with native fetch
        const res = await fetch(uploadUrl.toString(), {
          method: 'POST',
          body: uploadFormData,
        });

        if (!res.ok) {
          const errText = await res.text();
          lastError = new Error(`HTTP ${res.status}: ${errText.substring(0, 200)}`);
          console.warn(`[API_UPLOAD] Attempt ${attempt} failed:`, lastError.message);
          
          if (attempt < 3) {
            await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
          }
          continue;
        }

        publitio_response = await res.json();

        if (publitio_response && publitio_response.code < 400 && publitio_response.id) {
          console.log('[API_UPLOAD] Publitio upload success on attempt', attempt, {
            id: publitio_response.id,
            type: publitio_response.type,
          });
          break;
        } else {
          lastError = new Error(publitio_response?.message || `API error: ${publitio_response?.code}`);
          console.warn(`[API_UPLOAD] Attempt ${attempt} failed:`, lastError.message);
          
          if (attempt < 3) {
            await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
          }
        }
      } catch (err) {
        lastError = err;
        console.error(`[API_UPLOAD] Attempt ${attempt} error:`, err);
        
        if (attempt < 3) {
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        }
      }
    }

    // Check if upload succeeded
    if (!publitio_response || publitio_response.code >= 400 || !publitio_response.id) {
      const errorMsg = publitio_response?.message || lastError?.message || 'Upload failed after 3 attempts';
      console.error('[API_UPLOAD] Failed to upload:', errorMsg);
      return NextResponse.json(
        { data: null, error: `Upload failed: ${errorMsg}` },
        { status: publitio_response?.code || 502 }
      );
    }

    // Determine media type
    const type: MediaType = isVideo ? 'video' : 'image';

    // Build branded URL
    const publitioPath = publitio_response.url_preview || publitio_response.url_short || publitio_response.path || '';
    if (!publitioPath) {
      console.error('[API_UPLOAD] No URL in Publitio response:', publitio_response);
      return NextResponse.json(
        { data: null, error: 'Incomplete response from media server' },
        { status: 502 }
      );
    }

    const branded_url = buildBrandedUrl(publitioPath);

    // Insert into database
    console.log('[API_UPLOAD] Inserting into database:', {
      publitio_id: publitio_response.id,
      title,
      type,
      uploaded_by: session.user.id,
    });

    const { data: asset, error: dbError } = await db
      .from('media_assets')
      .insert([
        {
          publitio_id: publitio_response.id,
          title: title.trim(),
          type,
          branded_url,
          file_size_bytes: publitio_response.size || file.size,
          width_px: publitio_response.width,
          height_px: publitio_response.height,
          duration_secs: publitio_response.duration ? Math.round(publitio_response.duration) : null,
          uploaded_by: session.user.id,
        },
      ])
      .select()
      .single();

    if (dbError || !asset) {
      console.error('[API_UPLOAD] Database insert failed:', dbError);
      return NextResponse.json(
        { data: null, error: 'Failed to record asset in database' },
        { status: 500 }
      );
    }

    // Log audit trail
    await db.from('audit_log').insert([
      {
        admin_id: session.user.id,
        action: 'upload',
        media_id: asset.id,
        metadata: { title: asset.title, filename: file.name },
      },
    ]);

    const duration = Date.now() - startTime;
    console.log('[API_UPLOAD] Success in', duration, 'ms:', {
      assetId: asset.id,
      title: asset.title,
      type: asset.type,
    });

    // Remove publitio_id before sending to client
    const { publitio_id: _, ...sanitizedAsset } = asset as any;
    return NextResponse.json({ data: sanitizedAsset, error: null });
  } catch (error: any) {
    console.error('[API_UPLOAD_POST] Unexpected error:', error);
    return NextResponse.json(
      { data: null, error: error.message || 'Unexpected error during upload' },
      { status: 500 }
    );
  }
}
