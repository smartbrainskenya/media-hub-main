import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { ApiResponse, AssetRequest } from '@/types';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ data: null, error: 'Unauthorized' }, { status: 401 });
    }

    if (!db) {
      return NextResponse.json({ data: null, error: 'Database not initialized' }, { status: 500 });
    }

    const { data, error } = await db
      .from('asset_requests')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[API_ADMIN_REQUESTS_GET]', error);
      return NextResponse.json({ data: null, error: 'Failed to fetch requests' }, { status: 500 });
    }

    return NextResponse.json({ data: (data || []) as AssetRequest[], error: null } as ApiResponse<AssetRequest[]>);
  } catch (error) {
    console.error('[API_ADMIN_REQUESTS_GET]', error);
    return NextResponse.json({ data: null, error: 'Failed to fetch requests' }, { status: 500 });
  }
}
