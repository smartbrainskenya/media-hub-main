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

    if (!content_type.startsWith('image/') && !content_type.startsWith('video/')) {
      return NextResponse.json({ data: null, error: 'Invalid file type. Only images and videos are allowed.' }, { status: 400 });
    }

    // @ts-ignore
    const signature = await publitio.getSignature({
      action: '/files/create',
      method: 'POST',
      filename,
      content_type,
    });

    return NextResponse.json({ 
      data: {
        signature: signature.signature,
        timestamp: signature.timestamp,
        nonce: signature.nonce,
        api_key: process.env.PUBLITIO_API_KEY,
        upload_url: 'https://api.publit.io/v1/files/create'
      }, 
      error: null 
    });
  } catch (error: any) {
    console.error('[API_UPLOAD_SIGN_POST]', error);
    return NextResponse.json({ data: null, error: 'Failed to generate upload signature' }, { status: 500 });
  }
}
