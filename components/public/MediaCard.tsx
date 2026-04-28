'use client';

import Link from 'next/link';
import { SanitizedMediaAsset } from '@/types';
import { getVideoThumbnailUrl } from '@/lib/utils';
import { formatCategoryLabel } from '@/lib/categories';

interface MediaCardProps {
  asset: SanitizedMediaAsset;
  onClick?: (asset: SanitizedMediaAsset) => void;
}

export default function MediaCard({ asset, onClick }: MediaCardProps) {
  const isVideo = asset.type === 'video';
  const categoryLabel = formatCategoryLabel(asset.category_slug);
  const thumbnailSrc = isVideo ? getVideoThumbnailUrl(asset.branded_url) : asset.branded_url;

  const cardBody = (
    <div className={isVideo ? 'legacy-video-card' : 'legacy-image-card'}>
      {isVideo ? (
        <div className="legacy-video-thumbnail-wrapper">
          <img src={thumbnailSrc} alt={asset.title} loading="lazy" decoding="async" />
          <div className="legacy-play-overlay" aria-hidden="true">
            <span className="legacy-play-icon">▶</span>
          </div>
        </div>
      ) : (
        <img src={thumbnailSrc} alt={asset.title} loading="lazy" decoding="async" />
      )}
      <div className={isVideo ? 'legacy-video-info' : 'legacy-card-body'}>
        <h3 className="legacy-card-title">{asset.title}</h3>
        <span className="legacy-category-tag">{categoryLabel}</span>
      </div>
    </div>
  );

  if (onClick) {
    return (
      <button type="button" onClick={() => onClick(asset)} className="legacy-card-button">
        {cardBody}
      </button>
    );
  }

  return <Link href={`/media/${asset.id}`}>{cardBody}</Link>;
}
