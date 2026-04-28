'use client';

import { useState } from 'react';
import { MediaType, SanitizedMediaAsset } from '@/types';
import AssetPreviewModal from './AssetPreviewModal';
import MediaCard from './MediaCard';

interface MediaGridProps {
  type: MediaType;
  assets: SanitizedMediaAsset[];
  emptyMessage?: string;
  emptyActionLabel?: string;
  onEmptyAction?: () => void;
  isLoading?: boolean;
}

export default function MediaGrid({
  type,
  assets,
  emptyMessage = 'No media found.',
  emptyActionLabel,
  onEmptyAction,
  isLoading = false,
}: MediaGridProps) {
  const [selectedAsset, setSelectedAsset] = useState<SanitizedMediaAsset | null>(null);
  const gridClassName = type === 'image' ? 'legacy-image-grid' : 'legacy-video-grid';

  if (isLoading) {
    return (
      <div className={gridClassName}>
        {[...Array(8)].map((_, i) => (
          <div key={i} className="legacy-card" style={{ minHeight: 280, opacity: 0.35 }}></div>
        ))}
      </div>
    );
  }

  if (assets.length === 0) {
    return (
      <div className={gridClassName}>
        <div className="legacy-no-results">
          <p>{emptyMessage}</p>
          {emptyActionLabel && onEmptyAction ? (
            <button type="button" className="legacy-btn-secondary legacy-request-trigger" onClick={onEmptyAction}>
              {emptyActionLabel}
            </button>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className={gridClassName}>
        {assets.map((asset) => (
          <MediaCard key={asset.id} asset={asset} onClick={setSelectedAsset} />
        ))}
      </div>
      {!isLoading && selectedAsset && (
        <AssetPreviewModal asset={selectedAsset} onClose={() => setSelectedAsset(null)} />
      )}
    </>
  );
}
