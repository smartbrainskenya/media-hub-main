'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Play } from 'lucide-react';
import { MediaAsset } from '@/types';
import { cn, getVideoThumbnailUrl } from '@/lib/utils';
import { formatCategoryLabel, getCategoryBadgeClass } from '@/lib/categories';

interface MediaCardProps {
  asset: MediaAsset;
  onClick?: (asset: MediaAsset) => void;
}

export default function MediaCard({ asset, onClick }: MediaCardProps) {
  const isVideo = asset.type === 'video';
  const thumbnailAspectClass = isVideo ? 'aspect-video' : 'aspect-[4/3]';
  const thumbnailFitClass = isVideo ? 'object-cover' : 'object-contain';
  const categoryLabel = formatCategoryLabel(asset.category_slug);

  const cardBody = (
    <div className="bg-brand-surface border border-brand-border rounded-lg overflow-hidden transition-all hover:shadow-md h-full flex flex-col">
      <div className={cn('relative w-full bg-gray-100 overflow-hidden flex-shrink-0', thumbnailAspectClass)}>
        <Image
          src={isVideo ? getVideoThumbnailUrl(asset.branded_url) : asset.branded_url}
          alt={asset.title}
          fill
          className={cn('w-full h-full transition-transform group-hover:scale-105', thumbnailFitClass)}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          quality={75}
          loading="lazy"
          unoptimized={isVideo}
        />
        {isVideo && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition-colors">
            <div className="bg-white/90 p-2 rounded-full shadow-lg">
              <Play className="h-6 w-6 text-brand-primary fill-brand-primary" />
            </div>
          </div>
        )}
      </div>
      <div className="p-4 flex flex-col flex-grow">
        <h3 className="font-semibold text-brand-primary line-clamp-2 leading-tight mb-2">{asset.title}</h3>
        <div className="mt-auto">
          <span
            className={cn(
              'inline-flex px-2.5 py-1 rounded text-xs font-extrabold tracking-wide',
              getCategoryBadgeClass(asset.category_slug)
            )}
          >
            {categoryLabel}
          </span>
        </div>
      </div>
    </div>
  );

  if (onClick) {
    return (
      <button
        type="button"
        onClick={() => onClick(asset)}
        className="group w-full text-left focus:outline-none"
      >
        {cardBody}
      </button>
    );
  }

  return (
    <Link href={`/media/${asset.id}`} className="group">
      {cardBody}
    </Link>
  );
}
