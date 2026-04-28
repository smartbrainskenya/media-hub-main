import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { UpdateAssetRequestStatusSchema } from '@/lib/validations';
import { ApiResponse, AssetRequest } from '@/types';

interface Params {
  params: Promise<{ id: string }>;
}

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ data: null, error: 'Unauthorized' }, { status: 401 });
    }

    if (!db) {
      return NextResponse.json({ data: null, error: 'Database not initialized' }, { status: 500 });
    }

    const { id } = await params;
    const json = await req.json();
    const parsed = UpdateAssetRequestStatusSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json({ data: null, error: parsed.error.issues[0]?.message || parsed.error.message }, { status: 400 });
    }

    const { data, error } = await db
      .from('asset_requests')
      .update({ status: parsed.data.status })
      .eq('id', id)
      .select('*')
      .single();

    if (error || !data) {
      console.error('[API_ADMIN_REQUESTS_PATCH]', error);
      return NextResponse.json({ data: null, error: 'Failed to update request' }, { status: 500 });
    }

    return NextResponse.json({ data: data as AssetRequest, error: null } as ApiResponse<AssetRequest>);
  } catch (error) {
    console.error('[API_ADMIN_REQUESTS_PATCH]', error);
    return NextResponse.json({ data: null, error: 'Failed to update request' }, { status: 500 });
  }
}
