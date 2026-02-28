import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { publitio } from '@/lib/publitio';
import CryptoJS from 'crypto-js';

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

    const api_key = process.env.PUBLITIO_API_KEY!;
    const api_secret = process.env.PUBLITIO_API_SECRET!;
    const timestamp = Math.floor(Date.now() / 1000);
    const nonce = Math.floor(Math.random() * 100000000);
    const action = '/files/create';

    // Signature formula: sha1(timestamp + nonce + api_secret + action)
    const signature = CryptoJS.SHA1(timestamp + '' + nonce + api_secret + action).toString();

    return NextResponse.json({ 
      data: {
        signature,
        timestamp,
        nonce,
        api_key,
        upload_url: 'https://api.publit.io/v1/files/create'
      }, 
      error: null 
    });
  } catch (error: any) {
    console.error('[API_UPLOAD_SIGN_POST] Error:', error);
    return NextResponse.json({ data: null, error: 'Failed to generate upload signature' }, { status: 500 });
  }
}
