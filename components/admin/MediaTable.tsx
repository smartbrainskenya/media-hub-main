'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Edit2, ExternalLink, ChevronLeft, ChevronRight } from 'lucide-react';
import { MediaAsset } from '@/types';

interface MediaTableProps {
  assets: MediaAsset[];
  total: number;
  page: number;
}

export default function MediaTable({ assets, total, page }: MediaTableProps) {
  const perPage = 20;
  const totalPages = Math.ceil(total / perPage);

  return (
    <div className="flex flex-col h-full">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-brand-bg text-brand-muted text-xs uppercase tracking-wider">
              <th className="px-6 py-4 font-bold">Media</th>
              <th className="px-6 py-4 font-bold">Title</th>
              <th className="px-6 py-4 font-bold">Type</th>
              <th className="px-6 py-4 font-bold">URL</th>
              <th className="px-6 py-4 font-bold">Date</th>
              <th className="px-6 py-4 font-bold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-border">
            {assets.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-10 text-center text-brand-muted">
                  No media found.
                </td>
              </tr>
            ) : (
              assets.map((asset) => (
                <tr key={asset.id} className="hover:bg-brand-bg/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="relative h-12 w-20 rounded-md overflow-hidden bg-gray-100 border border-brand-border">
                      <Image
                        src={asset.branded_url}
                        alt={asset.title}
                        fill
                        className="object-cover"
                        sizes="80px"
                      />
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-semibold text-brand-primary text-sm line-clamp-1">{asset.title}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                      asset.type === 'video' 
                        ? 'bg-brand-secondary/10 text-brand-secondary' 
                        : 'bg-brand-primary/10 text-brand-primary'
                    }`}>
                      {asset.type}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 max-w-[200px]">
                      <code className="text-[10px] bg-brand-bg px-1.5 py-0.5 rounded text-brand-muted truncate">
                        {asset.branded_url}
                      </code>
                      <a href={asset.branded_url} target="_blank" rel="noopener noreferrer" className="text-brand-muted hover:text-brand-primary">
                        <ExternalLink size={12} />
                      </a>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs text-brand-muted whitespace-nowrap">
                    {new Date(asset.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link 
                      href={`/admin/media/${asset.id}`}
                      className="inline-flex items-center gap-1 text-brand-primary hover:bg-brand-primary hover:text-white px-3 py-1.5 rounded-md text-xs font-semibold transition-colors"
                    >
                      <Edit2 size={14} />
                      Edit
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Bar */}
      {totalPages > 1 && (
        <div className="px-6 py-4 border-t border-brand-border bg-white flex items-center justify-between">
          <p className="text-xs text-brand-muted">
            Page {page} of {totalPages} ({total} items)
          </p>
          <div className="flex items-center gap-2">
            <Link
              href={`/admin?page=${page - 1}`}
              className={`p-2 rounded-md border border-brand-border hover:border-brand-primary transition-colors ${
                page <= 1 ? 'pointer-events-none opacity-30' : ''
              }`}
            >
              <ChevronLeft size={16} />
            </Link>
            <Link
              href={`/admin?page=${page + 1}`}
              className={`p-2 rounded-md border border-brand-border hover:border-brand-primary transition-colors ${
                page >= totalPages ? 'pointer-events-none opacity-30' : ''
              }`}
            >
              <ChevronRight size={16} />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
