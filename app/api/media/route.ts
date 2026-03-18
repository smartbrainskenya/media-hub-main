import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth';
import { CreateMediaSchema } from '@/lib/validations';
import { ApiResponse, PaginatedResponse, MediaAsset, SanitizedMediaAsset } from '@/types';
import { DEFAULT_CATEGORY_SLUG, normalizeCategorySlug } from '@/lib/categories';

/**
 * GET /api/media
 * Public endpoint to list media assets
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    if (!db) {
      return NextResponse.json({ data: null, error: 'Database not initialized' }, { status: 500 });
    }

    const type = searchParams.get('type') as 'image' | 'video' | null;
    const category = searchParams.get('category');
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const perPage = Math.min(48, Math.max(1, parseInt(searchParams.get('per_page') || '24')));

    let query = db
      .from('media_assets')
      .select('*', { count: 'exact' });

    if (type) {
      query = query.eq('type', type);
    }
    if (category) {
      query = query.eq('category_slug', normalizeCategorySlug(category));
    }

    const { data, count, error } = await query
      .order('created_at', { ascending: false })
      .range((page - 1) * perPage, page * perPage - 1);

    if (error) throw error;

    // Sanitize response: remove publitio_id
    const sanitizedData = ((data || []) as MediaAsset[]).map(({ publitio_id: _, ...rest }) => ({
      ...rest
    })) as SanitizedMediaAsset[];

    const response: PaginatedResponse<SanitizedMediaAsset> = {
      data: sanitizedData,
      total: count || 0,
      page,
      per_page: perPage,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('[API_MEDIA_GET]', error);
    return NextResponse.json({ data: null, error: 'Failed to fetch media' }, { status: 500 });
  }
}

/**
 * POST /api/media
 * Protected endpoint to create a media record manually
 */
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ data: null, error: 'Unauthorized' }, { status: 401 });
    }

    if (!db) {
      return NextResponse.json({ data: null, error: 'Database not initialized' }, { status: 500 });
    }

    const json = await req.json();
    const parsed = CreateMediaSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json({ data: null, error: parsed.error.message }, { status: 400 });
    }

    const category_slug = parsed.data.category_slug
      ? normalizeCategorySlug(parsed.data.category_slug)
      : DEFAULT_CATEGORY_SLUG;

    const { data: asset, error } = await db
      .from('media_assets')
      .insert([
        {
          ...parsed.data,
          category_slug,
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
        action: 'upload',
        media_id: asset.id,
        metadata: { title: asset.title, category_slug: asset.category_slug || DEFAULT_CATEGORY_SLUG },
      },
    ]);

    const { publitio_id: _, ...sanitizedAsset } = asset as MediaAsset;
    return NextResponse.json({ data: sanitizedAsset, error: null } as ApiResponse<SanitizedMediaAsset>, { status: 201 });
  } catch (error) {
    console.error('[API_MEDIA_POST]', error);
    return NextResponse.json({ data: null, error: 'Failed to create media' }, { status: 500 });
  }
}
