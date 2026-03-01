import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { publitio } from '@/lib/publitio';

/**
 * POST /api/upload/sign
 * Protected endpoint to generate Publitio signed upload parameters
 */
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ data: null, error: 'Unauthorized' }, { status: 401 });
    }

    const json = await req.json();
    const { filename, content_type, file_size } = json;

    if (!filename || !content_type || !file_size) {
      return NextResponse.json({ data: null, error: 'Missing required fields' }, { status: 400 });
    }

    // 500MB limit
    if (file_size > 500 * 1024 * 1024) {
      return NextResponse.json({ data: null, error: 'File size exceeds 500MB limit' }, { status: 400 });
    }

    // publitio.uploadUrlSigned() automatically handles timestamp, secure nonce, signature, and kit
    const upload_url = publitio.uploadUrlSigned();

    console.log('[API_UPLOAD_SIGN] Generated signed url:', {
      url_prefix: upload_url.split('?')[0]
    });

    return NextResponse.json({ 
      data: {
        upload_url
      }, 
      error: null 
    });
  } catch (error: any) {
    console.error('[API_UPLOAD_SIGN_POST] Error:', error);
    return NextResponse.json({ data: null, error: 'Failed to generate upload signature' }, { status: 500 });
  }
}
