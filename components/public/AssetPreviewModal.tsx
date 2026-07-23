'use client';

import { useEffect, useRef, useState } from 'react';
import { SanitizedMediaAsset } from '@/types';
import { buildThumbnailUrl } from '@/lib/utils';
import PublicToast from './PublicToast';

interface AssetPreviewModalProps {
  asset: SanitizedMediaAsset;
  onClose: () => void;
}

export default function AssetPreviewModal({ asset, onClose }: AssetPreviewModalProps) {
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const isVideo = asset.type === 'video';
  const escapedTitle = asset.title.replace(/"/g, '&quot;');
  const imageHtmlCode = `<img src="${asset.branded_url}" alt="${escapedTitle}" />`;
  const videoHtmlCode = `<video src="${asset.branded_url}" controls></video>`;

  const buttonConfigs = isVideo
    ? [
        { label: 'Copy Video Link', value: asset.branded_url },
        { label: 'Copy Video HTML Code', value: videoHtmlCode },
      ]
    : [
        { label: 'Copy Image Address', value: asset.branded_url },
        { label: 'Copy Image HTML Code', value: imageHtmlCode },
      ];

  const copyText = async (value: string, label: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setToast({ message: `${label} copied to clipboard!`, type: 'success' });
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => setToast(null), 3000);
    } catch (error) {
      console.error('Copy failed', error);
      setToast({ message: 'Failed to copy. Please try again.', type: 'error' });
    }
  };

  const handleBackdropClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="legacy-modal-backdrop" onClick={handleBackdropClick}>
      <div className="legacy-modal-content" role="dialog" aria-modal="true">
        <button className="legacy-modal-close" onClick={onClose} aria-label="Close preview" type="button">
          ✕
        </button>
        <div className="legacy-modal-body">
          <h2 className="legacy-modal-title">{asset.title}</h2>
          {isVideo ? (
            <video
              controls
              className="legacy-modal-video"
              preload="metadata"
              onContextMenu={(event) => {
                event.currentTarget.style.cursor = 'context-menu';
              }}
            >
              <source src={asset.branded_url} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          ) : (
            <img
              src={buildThumbnailUrl(asset.branded_url, 1280, 720)}
              alt={asset.title}
              className="legacy-modal-image"
              onContextMenu={(event) => {
                event.currentTarget.style.cursor = 'context-menu';
              }}
            />
          )}
          <div className="legacy-modal-buttons">
            {buttonConfigs.map((button, index) => (
              <button
                key={button.label}
                type="button"
                onClick={() => copyText(button.value, button.label)}
                className={index === 0 ? 'legacy-btn-primary' : 'legacy-btn-secondary'}
              >
                {button.label}
              </button>
            ))}
          </div>
        </div>
      </div>
      {toast ? <PublicToast message={toast.message} type={toast.type} onClose={() => setToast(null)} /> : null}
    </div>
  );
}
