import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth';
import { publitio } from '@/lib/publitio';
import { UpdateMediaSchema } from '@/lib/validations';
import { MediaAsset } from '@/types';
import { DEFAULT_CATEGORY_SLUG, normalizeCategorySlug } from '@/lib/categories';

type Params = {
  params: Promise<{
    id: string;
  }>;
};

/**
 * GET /api/media/[id]
 * Public endpoint to fetch a single asset
 */
export async function GET(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    
    if (!db) {
      return NextResponse.json({ data: null, error: 'Database not initialized' }, { status: 500 });
    }

    const { data: asset, error } = await db
      .from('media_assets')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !asset) {
      return NextResponse.json({ data: null, error: 'Media not found' }, { status: 404 });
    }

    const { publitio_id: _, ...sanitizedAsset } = asset as MediaAsset;
    return NextResponse.json({ data: sanitizedAsset, error: null });
  } catch (error) {
    console.error('[API_MEDIA_ID_GET]', error);
    return NextResponse.json({ data: null, error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * PATCH /api/media/[id]
 * Protected endpoint to update media asset metadata
 */
export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ data: null, error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const json = await req.json();
    const parsed = UpdateMediaSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json({ data: null, error: parsed.error.message }, { status: 400 });
    }

    if (!db) {
      return NextResponse.json({ data: null, error: 'Database not initialized' }, { status: 500 });
    }

    const { data: existingAsset, error: existingError } = await db
      .from('media_assets')
      .select('title, category_slug')
      .eq('id', id)
      .single();

    if (existingError || !existingAsset) {
      return NextResponse.json({ data: null, error: 'Media not found' }, { status: 404 });
    }

    const updateData: { title?: string; category_slug?: string } = {};
    if (parsed.data.title !== undefined) {
      updateData.title = parsed.data.title.trim();
    }
    if (parsed.data.category_slug !== undefined) {
      updateData.category_slug = normalizeCategorySlug(parsed.data.category_slug);
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ data: null, error: 'No valid fields to update' }, { status: 400 });
    }

    const { data: asset, error } = await db
      .from('media_assets')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // Log action
    await db.from('audit_log').insert([
      {
        admin_id: session.user.id,
        action: 'rename',
        media_id: asset.id,
        metadata: {
          old_title: existingAsset.title,
          new_title: asset.title,
          old_category: existingAsset.category_slug || DEFAULT_CATEGORY_SLUG,
          new_category: asset.category_slug || DEFAULT_CATEGORY_SLUG,
        },
      },
    ]);

    const { publitio_id: _, ...sanitizedAsset } = asset as MediaAsset;
    return NextResponse.json({ data: sanitizedAsset, error: null });
  } catch (error) {
    console.error('[API_MEDIA_ID_PATCH]', error);
    return NextResponse.json({ data: null, error: 'Failed to update media' }, { status: 500 });
  }
}

/**
 * DELETE /api/media/[id]
 * Protected endpoint to delete a media asset
 */
export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ data: null, error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    if (!db || !publitio) {
      return NextResponse.json({ data: null, error: 'System not fully initialized' }, { status: 500 });
    }

    // Get asset info first
    const { data: asset, error: fetchError } = await db
      .from('media_assets')
      .select('publitio_id, title')
      .eq('id', id)
      .single();

    if (fetchError || !asset) {
      return NextResponse.json({ data: null, error: 'Media not found' }, { status: 404 });
    }

    // Delete from Publitio
    try {
      await publitio.call(`/files/delete/${asset.publitio_id}`, 'DELETE');
    } catch (publitioError) {
      console.warn('[API_MEDIA_ID_DELETE] Publitio deletion failed:', publitioError);
      // We continue since we want to remove the record from our DB even if Publitio fails
    }

    // Delete from Supabase
    const { error: deleteError } = await db
      .from('media_assets')
      .delete()
      .eq('id', id);

    if (deleteError) throw deleteError;

    // Log action
    await db.from('audit_log').insert([
      {
        admin_id: session.user.id,
        action: 'delete',
        metadata: { title: asset.title },
      },
    ]);

    return NextResponse.json({ data: null, error: null });
  } catch (error) {
    console.error('[API_MEDIA_ID_DELETE]', error);
    return NextResponse.json({ data: null, error: 'Failed to delete media' }, { status: 500 });
  }
}
