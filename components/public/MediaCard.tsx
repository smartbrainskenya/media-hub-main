import Image from 'next/image';
import Link from 'next/link';
import { Play } from 'lucide-react';
import { MediaAsset } from '@/types';
import { cn } from '@/lib/utils';

export default function MediaCard({ asset }: { asset: MediaAsset }) {
  const isVideo = asset.type === 'video';
  return (
    <Link href={`/media/${asset.id}`} className="group">
      <div className="bg-brand-surface border border-brand-border rounded-lg overflow-hidden transition-all hover:shadow-md h-full flex flex-col">
        <div className="relative aspect-video bg-gray-100 overflow-hidden">
          <Image src={asset.branded_url} alt={asset.title} fill className="object-cover transition-transform group-hover:scale-105" sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" quality={75} loading="lazy" />
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
          <div className="mt-auto flex items-center gap-2">
            <span className={cn("px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded", isVideo ? "bg-brand-secondary/10 text-brand-secondary" : "bg-brand-primary/10 text-brand-primary")}>{asset.type}</span>
            <span className="text-xs text-brand-muted">{new Date(asset.created_at).toLocaleDateString()}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
