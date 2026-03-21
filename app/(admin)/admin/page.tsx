import { db } from '@/lib/db';
import MediaTable from '@/components/admin/MediaTable';
import { MediaAsset } from '@/types';
import { ImageIcon, Film, LayoutDashboard } from 'lucide-react';
import { cn } from '@/lib/utils';

export const dynamic = 'force-dynamic';

async function getStats() {
  if (!db) return { total: 0, images: 0, videos: 0 };
  
  const { count: total } = await db.from('media_assets').select('*', { count: 'exact', head: true });
  const { count: images } = await db.from('media_assets').select('*', { count: 'exact', head: true }).eq('type', 'image');
  const { count: videos } = await db.from('media_assets').select('*', { count: 'exact', head: true }).eq('type', 'video');
  
  return {
    total: total || 0,
    images: images || 0,
    videos: videos || 0
  };
}

async function getMedia(page: number, type?: 'image' | 'video') {
  if (!db) return { data: [], total: 0 };
  
  const perPage = 20;
  let query = db
    .from('media_assets')
    .select('*', { count: 'exact' });
  
  if (type) {
    query = query.eq('type', type);
  }
  
  const { data, count, error } = await query
    .order('created_at', { ascending: false })
    .range((page - 1) * perPage, page * perPage - 1);

  if (error) {
    console.error('Error fetching admin media:', error);
    return { data: [], total: 0 };
  }

  return { 
    data: data as MediaAsset[], 
    total: count || 0 
  };
}

export default async function AdminDashboard({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; type?: string }>;
}) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page || '1'));
  const type = params.type as 'image' | 'video' | undefined;
  const stats = await getStats();
  const { data: assets, total } = await getMedia(page, type);

  const statCards = [
    { label: 'Total Assets', value: stats.total, icon: LayoutDashboard, color: 'bg-brand-primary' },
    { label: 'Images', value: stats.images, icon: ImageIcon, color: 'bg-blue-500' },
    { label: 'Videos', value: stats.videos, icon: Film, color: 'bg-brand-secondary' },
  ];

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-white p-6 rounded-xl border border-brand-border shadow-sm flex items-center gap-4">
              <div className={cn("p-3 rounded-lg text-white", stat.color)}>
                <Icon size={24} />
              </div>
              <div>
                <p className="text-sm font-medium text-brand-muted">{stat.label}</p>
                <p className="text-2xl font-bold text-brand-primary">{stat.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Media Table */}
      <div className="bg-white rounded-xl border border-brand-border shadow-sm overflow-hidden">
        <div className="p-6 border-b border-brand-border flex justify-between items-center">
          <h3 className="font-bold text-brand-primary">Media Library</h3>
          <p className="text-sm text-brand-muted">Total {total} items</p>
        </div>
        <MediaTable assets={assets} total={total} page={page} type={type} imageTotalCount={stats.images} videoTotalCount={stats.videos} />
      </div>
    </div>
  );
}
