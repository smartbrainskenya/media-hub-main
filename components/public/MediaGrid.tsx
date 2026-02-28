import { MediaAsset } from '@/types';
import MediaCard from './MediaCard';

export default function MediaGrid({ assets, emptyMessage = "No media found.", isLoading = false }: { assets: MediaAsset[], emptyMessage?: string, isLoading?: boolean }) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="aspect-video bg-gray-200 animate-pulse rounded-lg"></div>
        ))}
      </div>
    );
  }
  if (assets.length === 0) {
    return (
      <div className="text-center py-20 bg-brand-surface border border-brand-border border-dashed rounded-xl">
        <p className="text-brand-muted">{emptyMessage}</p>
      </div>
    );
  }
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {assets.map((asset) => (
        <MediaCard key={asset.id} asset={asset} />
      ))}
    </div>
  );
}
