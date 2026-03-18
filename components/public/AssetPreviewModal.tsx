'use client';

import Image from 'next/image';
import { useCallback, useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import { MediaAsset } from '@/types';
import { cn } from '@/lib/utils';

interface AssetPreviewModalProps {
  asset: MediaAsset;
  onClose: () => void;
}

export default function AssetPreviewModal({ asset, onClose }: AssetPreviewModalProps) {
  const [copiedAction, setCopiedAction] = useState('');
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

  const notifyCopied = useCallback((label: string) => {
    setCopiedAction(label);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => setCopiedAction(''), 2000);
  }, []);

  const copyText = useCallback(
    async (value: string, label: string) => {
      try {
        await navigator.clipboard.writeText(value);
        notifyCopied(label);
      } catch (error) {
        console.error('Copy failed', error);
      }
    },
    [notifyCopied]
  );

  const isVideo = asset.type === 'video';
  const escapedTitle = asset.title.replace(/"/g, '&quot;');
  const imageHtmlCode = `<img src="${asset.branded_url}" alt="${escapedTitle}">`;
  const videoEmbedCode = `<video width="320" height="240" controls>
  <source src="${asset.branded_url}" type="video/mp4">
</video>`;

  const buttonConfigs = isVideo
    ? [
        { label: 'Copy Video Link', value: asset.branded_url },
        { label: 'Copy Video Embed Code', value: videoEmbedCode },
      ]
    : [
        { label: 'Copy Image Address', value: asset.branded_url },
        { label: 'Copy Image HTML Code', value: imageHtmlCode },
      ];

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center px-4 py-6">
      <div className="absolute inset-0 bg-brand-primary/50 backdrop-blur-sm" onClick={onClose} aria-hidden="true"></div>
      <div
        role="dialog"
        aria-modal="true"
        className="relative w-full max-w-3xl bg-brand-surface border border-brand-border rounded-[28px] shadow-2xl overflow-hidden"
      >
        <div className="flex items-center justify-between px-6 pt-6">
          <h2 className="text-xl font-semibold text-brand-primary">{asset.title}</h2>
          <button
            onClick={onClose}
            aria-label="Close preview"
            className="w-10 h-10 rounded-full bg-brand-surface border border-brand-border text-brand-muted hover:text-brand-primary transition"
            type="button"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="px-6 pb-6">
          <div className="mt-4 rounded-2xl border border-brand-border bg-gray-50 overflow-hidden">
            {isVideo ? (
              <div className="relative w-full max-h-[60vh] min-h-[260px] bg-black">
                <video
                  src={asset.branded_url}
                  controls
                  className="w-full h-full object-contain"
                  autoPlay={false}
                  preload="metadata"
                />
              </div>
            ) : (
              <div className="relative w-full max-h-[60vh] min-h-[260px]">
                <Image src={asset.branded_url} alt={asset.title} fill className="object-contain" />
              </div>
            )}
          </div>

          <div className="mt-6 space-y-2">
            <div className="grid gap-4 sm:grid-cols-2">
              {buttonConfigs.map((btn, index) => (
                <button
                  key={btn.label}
                  type="button"
                  onClick={() => copyText(btn.value, btn.label)}
                  className={cn(
                    'w-full py-3 px-5 text-sm font-semibold rounded-xl transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary',
                    index === 0
                      ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/20 hover:bg-brand-primary/90'
                      : 'bg-white border border-brand-primary text-brand-primary hover:bg-brand-primary/5'
                  )}
                >
                  {btn.label}
                </button>
              ))}
            </div>
            {copiedAction && (
              <p className="text-xs text-brand-success">{`${copiedAction} copied to clipboard.`}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
