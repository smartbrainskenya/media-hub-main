import { db } from '@/lib/db';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Maximize, Clock, FileText } from 'lucide-react';
import URLCopyButton from '@/components/public/URLCopyButton';
import { formatFileSize, formatDuration } from '@/lib/utils';
import { MediaAsset } from '@/types';

export const revalidate = 60;

interface MediaDetailPageProps {
  params: Promise<{ id: string }>;
}

async function getMediaAsset(id: string): Promise<MediaAsset | null> {
  if (!db) return null;
  const { data, error } = await db
    .from('media_assets')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) return null;
  return data as MediaAsset;
}

export default async function MediaDetailPage({ params }: MediaDetailPageProps) {
  const { id } = await params;
  const asset = await getMediaAsset(id);

  if (!asset) notFound();

  const isVideo = asset.type === 'video';

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <Link
        href={isVideo ? '/videos' : '/images'}
        className="inline-flex items-center gap-2 text-brand-muted hover:text-brand-primary transition-colors font-medium"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to {isVideo ? 'Videos' : 'Images'}
      </Link>

      <div className="grid lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-brand-border rounded-2xl overflow-hidden shadow-sm">
            {isVideo ? (
              <div className="aspect-video bg-black flex items-center justify-center">
                <video src={asset.branded_url} controls className="w-full h-full" />
              </div>
            ) : (
              <div className="relative aspect-video bg-gray-50">
                <Image src={asset.branded_url} alt={asset.title} fill className="object-contain" priority />
              </div>
            )}
          </div>
        </div>

        <div className="space-y-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className={`px-2 py-1 text-xs font-bold uppercase tracking-wider rounded ${isVideo ? "bg-brand-secondary/10 text-brand-secondary" : "bg-brand-primary/10 text-brand-primary"}`}>
                {asset.type}
              </span>
              <span className="text-xs text-brand-muted">Added {new Date(asset.created_at).toLocaleDateString()}</span>
            </div>
            <h1 className="text-2xl font-bold text-brand-primary leading-tight">{asset.title}</h1>
          </div>
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-brand-primary uppercase tracking-wider">Direct URL</h3>
            <URLCopyButton url={asset.branded_url} />
          </div>
          <div className="pt-6 border-t border-brand-border space-y-4">
            <h3 className="text-sm font-bold text-brand-primary uppercase tracking-wider">Metadata</h3>
            <div className="grid grid-cols-2 gap-4">
              {asset.width_px && asset.height_px && (
                <div className="flex items-center gap-3 text-brand-muted">
                  <Maximize className="h-4 w-4" />
                  <div className="text-xs">
                    <p className="font-semibold text-brand-primary">Dimensions</p>
                    <p>{asset.width_px} × {asset.height_px}px</p>
                  </div>
                </div>
              )}
              {asset.file_size_bytes && (
                <div className="flex items-center gap-3 text-brand-muted">
                  <FileText className="h-4 w-4" />
                  <div className="text-xs">
                    <p className="font-semibold text-brand-primary">File Size</p>
                    <p>{formatFileSize(asset.file_size_bytes)}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
