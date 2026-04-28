import { db } from '@/lib/db';
import PublicGalleryPage from '@/components/public/PublicGalleryPage';
import { MediaAsset, SanitizedMediaAsset } from '@/types';
import { CATEGORY_PRESETS, normalizeCategorySlug } from '@/lib/categories';

export const revalidate = 60;
const PER_PAGE = 12;

interface VideosPageProps {
  searchParams: Promise<{ page?: string; q?: string; category?: string }>;
}

function sanitizeSearchQuery(value: string | undefined): string {
  return (value || '').trim().slice(0, 120);
}

function escapeLikePattern(value: string): string {
  return value.replace(/[%_]/g, '\\$&');
}

function normalizeCategoryFilter(value: string | undefined): string {
  if (!value || value === 'all') return 'all';
  const normalized = normalizeCategorySlug(value);
  return CATEGORY_PRESETS.includes(normalized as (typeof CATEGORY_PRESETS)[number]) ? normalized : 'all';
}

function sanitizeMediaAsset(asset: MediaAsset): SanitizedMediaAsset {
  const { publitio_id, ...rest } = asset;
  void publitio_id;
  return rest;
}

async function getVideos(page: number, searchQuery: string, categoryFilter: string) {
  if (!db) return { data: [], total: 0 };

  let query = db
    .from('media_assets')
    .select('*', { count: 'exact' })
    .eq('type', 'video');

  if (searchQuery) {
    query = query.ilike('title', `%${escapeLikePattern(searchQuery)}%`);
  }

  if (categoryFilter !== 'all') {
    query = query.eq('category_slug', categoryFilter);
  }

  const { data, count, error } = await query
    .order('created_at', { ascending: false })
    .range((page - 1) * PER_PAGE, page * PER_PAGE - 1);

  if (error) return { data: [], total: 0 };

  const sanitized = ((data || []) as MediaAsset[]).map(sanitizeMediaAsset);
  return { data: sanitized, total: count || 0 };
}

export default async function VideosPage({ searchParams }: VideosPageProps) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page || '1', 10));
  const searchQuery = sanitizeSearchQuery(params.q);
  const categoryFilter = normalizeCategoryFilter(params.category);
  const hasFilters = Boolean(searchQuery) || categoryFilter !== 'all';

  const { data: videos, total } = await getVideos(page, searchQuery, categoryFilter);
  const totalPages = Math.ceil(total / PER_PAGE);

  const buildPageHref = (nextPage: number) => {
    const query = new URLSearchParams();
    query.set('page', String(nextPage));
    if (searchQuery) query.set('q', searchQuery);
    if (categoryFilter !== 'all') query.set('category', categoryFilter);
    return `/videos?${query.toString()}`;
  };

  return (
    <PublicGalleryPage
      type="video"
      title="Video Library"
      description="Watch and learn with our engaging videos!"
      total={total}
      assets={videos}
      basePath="/videos"
      crossNavHref="/images"
      crossNavLabel="Explore Images"
      crossNavIcon="🖼"
      searchQuery={searchQuery}
      categoryFilter={categoryFilter}
      hasFilters={hasFilters}
      searchPlaceholder="Find a video to watch..."
      paginationLinks={[...Array(totalPages)].map((_, index) => ({
        page: index + 1,
        href: buildPageHref(index + 1),
      }))}
      currentPage={page}
    />
  );
}
