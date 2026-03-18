'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Trash2, ExternalLink, Image as ImageIcon } from 'lucide-react';
import { getVideoThumbnailUrl } from '@/lib/utils';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import RenameForm from '@/components/admin/RenameForm';
import DeleteConfirmModal from '@/components/admin/DeleteConfirmModal';
import { MediaAsset } from '@/types';
import { formatCategoryLabel, getCategoryBadgeClass } from '@/lib/categories';

interface EditMediaPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function EditMediaPage({ params }: EditMediaPageProps) {
  const { id } = use(params);
  const [asset, setAsset] = useState<MediaAsset | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchAsset = async () => {
      try {
        const res = await axios.get(`/api/media/${id}`);
        setAsset(res.data.data);
      } catch {
        toast.error('Failed to load asset details');
        router.push('/admin');
      } finally {
        setIsLoading(false);
      }
    };
    fetchAsset();
  }, [id, router]);

  const handleDelete = async () => {
    try {
      await axios.delete(`/api/media/${id}`);
      toast.success('Media deleted successfully');
      router.push('/admin');
      router.refresh();
    } catch (error) {
      const errorMessage = axios.isAxiosError(error)
        ? error.response?.data?.error
        : error instanceof Error
          ? error.message
          : null;
      toast.error(errorMessage || 'Failed to delete media');
      throw error; // Re-throw for the modal's error state
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <div className="w-10 h-10 border-4 border-brand-primary/20 border-t-brand-primary rounded-full animate-spin"></div>
        <p className="text-brand-muted font-medium">Loading asset details...</p>
      </div>
    );
  }

  if (!asset) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
      {/* Navigation */}
      <Link
        href="/admin"
        className="inline-flex items-center gap-2 text-brand-muted hover:text-brand-primary transition-colors font-medium"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Dashboard
      </Link>

      <div className="flex flex-col md:flex-row gap-10">
        {/* Preview Side */}
        <div className="md:w-1/3 space-y-6">
          <div className="bg-white border border-brand-border rounded-xl overflow-hidden shadow-sm">
            <div className="aspect-video bg-brand-bg relative flex items-center justify-center">
              <img 
                src={asset.type === 'video' ? getVideoThumbnailUrl(asset.branded_url) : asset.branded_url} 
                alt={asset.title} 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-4 border-t border-brand-border space-y-2">
              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                  asset.type === 'video' ? 'bg-brand-secondary/10 text-brand-secondary' : 'bg-brand-primary/10 text-brand-primary'
                }`}>
                  {asset.type}
                </span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${getCategoryBadgeClass(asset.category_slug)}`}>
                  {formatCategoryLabel(asset.category_slug)}
                </span>
                <p className="text-[10px] text-brand-muted uppercase font-bold tracking-widest">Tags</p>
              </div>
              <p className="text-xs text-brand-muted truncate font-mono bg-brand-bg p-2 rounded border border-brand-border">
                {asset.branded_url}
              </p>
              <a 
                href={asset.branded_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-2 bg-brand-bg hover:bg-brand-border text-brand-primary text-xs font-bold rounded transition-colors"
              >
                <ExternalLink size={14} />
                View Full Asset
              </a>
            </div>
          </div>
        </div>

        {/* Form Side */}
        <div className="flex-grow space-y-10">
          <section className="bg-white p-8 rounded-xl border border-brand-border shadow-sm">
            <h3 className="text-lg font-bold text-brand-primary mb-6 flex items-center gap-2">
              <span className="p-1.5 bg-brand-primary/5 rounded-md">
                <ImageIcon size={20} className="text-brand-primary" />
              </span>
              Asset Management
            </h3>
            <RenameForm asset={asset} onSuccess={(updated) => setAsset(updated)} />
          </section>

          <section className="bg-brand-danger/5 p-8 rounded-xl border border-brand-danger/10">
            <h3 className="text-lg font-bold text-brand-danger mb-2 flex items-center gap-2">
              <span className="p-1.5 bg-brand-danger/10 rounded-md">
                <Trash2 size={20} className="text-brand-danger" />
              </span>
              Danger Zone
            </h3>
            <p className="text-sm text-brand-muted mb-6">
              Deleting this asset is permanent. It will be removed from the public library and our storage server immediately.
            </p>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="px-6 py-3 bg-brand-danger text-white font-bold rounded-lg hover:bg-opacity-90 transition-all flex items-center gap-2 shadow-lg shadow-brand-danger/20"
            >
              <Trash2 size={18} />
              Permanently Delete Asset
            </button>
          </section>
        </div>
      </div>

      {showDeleteModal && (
        <DeleteConfirmModal
          asset={asset}
          onConfirm={handleDelete}
          onCancel={() => setShowDeleteModal(false)}
        />
      )}
    </div>
  );
}
