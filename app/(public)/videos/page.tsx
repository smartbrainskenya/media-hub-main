import { db } from '@/lib/db';
import MediaGrid from '@/components/public/MediaGrid';
import { MediaAsset } from '@/types';

export const revalidate = 60;

interface VideosPageProps {
  searchParams: Promise<{ page?: string }>;
}

async function getVideos(page: number) {
  if (!db) return { data: [], total: 0 };
  const perPage = 12;
  const { data, count, error } = await db
    .from('media_assets')
    .select('*', { count: 'exact' })
    .eq('type', 'video')
    .order('created_at', { ascending: false })
    .range((page - 1) * perPage, page * perPage - 1);

  if (error) return { data: [], total: 0 };
  return { data: data as MediaAsset[], total: count || 0 };
}

export default async function VideosPage({ searchParams }: VideosPageProps) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page || '1'));
  const { data: videos, total } = await getVideos(page);
  const totalPages = Math.ceil(total / 12);

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-brand-border pb-6">
        <div>
          <h1 className="text-3xl font-bold text-brand-primary">Video Library</h1>
          <p className="text-brand-muted mt-1">High-quality branded videos for your coursework.</p>
        </div>
        <p className="text-sm text-brand-muted">Showing {videos.length} of {total} videos</p>
      </div>
      <MediaGrid assets={videos} emptyMessage="No videos have been added yet." />
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-10">
          {[...Array(totalPages)].map((_, i) => (
            <a
              key={i + 1}
              href={`/videos?page=${i + 1}`}
              className={`w-10 h-10 flex items-center justify-center rounded-lg border transition-colors ${
                (i + 1) === page ? "bg-brand-secondary text-brand-primary border-brand-secondary" : "bg-brand-surface text-brand-muted border-brand-border hover:border-brand-secondary"
              }`}
            >
              {i + 1}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
