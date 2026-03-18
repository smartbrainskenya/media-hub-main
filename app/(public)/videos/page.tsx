import { db } from '@/lib/db';
import MediaGrid from '@/components/public/MediaGrid';
import { MediaAsset } from '@/types';
import Link from 'next/link';
import { CATEGORY_PRESETS, formatCategoryLabel, normalizeCategorySlug } from '@/lib/categories';

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
  return { data: (data || []) as MediaAsset[], total: count || 0 };
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
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-brand-border pb-6">
        <div>
          <h1 className="text-3xl font-bold text-brand-primary">Video Library</h1>
          <p className="text-brand-muted mt-1">High-quality branded videos for your coursework.</p>
        </div>
        <p className="text-sm text-brand-muted">Showing {videos.length} of {total} videos</p>
      </div>

      <form action="/videos" method="GET" className="bg-brand-surface border border-brand-border rounded-xl p-4 md:p-5">
        <div className="grid gap-3 md:grid-cols-[1fr_auto_auto]">
          <input
            type="search"
            name="q"
            defaultValue={searchQuery}
            placeholder="Search videos by name..."
            className="w-full px-4 py-2.5 border border-brand-border rounded-lg bg-white focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none"
          />
          <select
            name="category"
            defaultValue={categoryFilter}
            className="px-4 py-2.5 border border-brand-border rounded-lg bg-white text-brand-primary focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none"
          >
            <option value="all">All Categories</option>
            {CATEGORY_PRESETS.map((category) => (
              <option key={category} value={category}>
                {formatCategoryLabel(category)}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="px-5 py-2.5 bg-brand-secondary text-brand-primary font-semibold rounded-lg hover:bg-brand-secondary/90 transition-colors"
          >
            Search
          </button>
        </div>
        {hasFilters && (
          <div className="pt-3">
            <Link href="/videos" className="text-sm font-medium text-brand-muted hover:text-brand-primary transition-colors">
              Clear filters
            </Link>
          </div>
        )}
      </form>

      <MediaGrid
        assets={videos}
        emptyMessage={hasFilters ? 'No videos match your search or category filter.' : 'No videos have been added yet.'}
      />
      
      {totalPages > 1 && (
        <nav className="flex items-center justify-center gap-2 pt-10" aria-label="Pagination">
          {[...Array(totalPages)].map((_, i) => (
            <Link
              key={i + 1}
              href={buildPageHref(i + 1)}
              className={`w-10 h-10 flex items-center justify-center rounded-lg border font-medium transition-all ${
                (i + 1) === page 
                  ? "bg-brand-secondary text-brand-primary border-brand-secondary shadow-sm" 
                  : "bg-brand-surface text-brand-muted border-brand-border hover:border-brand-secondary hover:shadow-md"
              }`}
              aria-current={(i + 1) === page ? 'page' : undefined}
            >
              {i + 1}
            </Link>
          ))}
        </nav>
      )}
    </div>
  );
}
