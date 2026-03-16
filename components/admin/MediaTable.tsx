'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ExternalLink, ChevronLeft, ChevronRight, Trash2, LayoutList, LayoutGrid, Save, X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { MediaAsset } from '@/types';
import DeleteConfirmModal from './DeleteConfirmModal';

interface MediaTableProps {
  assets: MediaAsset[];
  total: number;
  page: number;
}

type ViewMode = 'list' | 'block';

export default function MediaTable({ assets: initialAssets, total, page }: MediaTableProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [assets, setAssets] = useState(initialAssets);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [deletingAsset, setDeletingAsset] = useState<MediaAsset | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const perPage = 20;
  const totalPages = Math.ceil(total / perPage);

  // Handle inline rename
  const startEdit = (asset: MediaAsset) => {
    setEditingId(asset.id);
    setEditingTitle(asset.title);
  };

  const saveEdit = async (assetId: string) => {
    if (!editingTitle.trim()) {
      toast.error('Title cannot be empty');
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch(`/api/media/${assetId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: editingTitle.trim() }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || `HTTP ${res.status}`);
      }

      const result = await res.json();
      
      // Update local state
      setAssets((prev) =>
        prev.map((a) => (a.id === assetId ? { ...a, title: editingTitle.trim() } : a))
      );

      toast.success('Title updated successfully');
      setEditingId(null);
    } catch (error: any) {
      toast.error(`Failed to update title: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingTitle('');
  };

  // Handle delete
  const startDelete = (asset: MediaAsset) => {
    setDeletingAsset(asset);
  };

  const confirmDelete = async () => {
    if (!deletingAsset) return;

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/media/${deletingAsset.id}`, { method: 'DELETE' });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || `HTTP ${res.status}`);
      }

      // Update local state
      setAssets((prev) => prev.filter((a) => a.id !== deletingAsset.id));
      toast.success('Media deleted successfully');
      setDeletingAsset(null);
    } catch (error: any) {
      toast.error(`Failed to delete media: ${error.message}`);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex flex-col h-full space-y-4">
      {/* View Toggle */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-brand-muted font-medium">
          Total {assets.length} of {total} items
        </div>
        <div className="flex items-center gap-2 bg-brand-bg p-1 rounded-lg border border-brand-border">
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-md transition-all ${
              viewMode === 'list'
                ? 'bg-white text-brand-primary shadow-sm border border-brand-border'
                : 'text-brand-muted hover:text-brand-primary'
            }`}
            title="List View"
          >
            <LayoutList size={18} />
          </button>
          <button
            onClick={() => setViewMode('block')}
            className={`p-2 rounded-md transition-all ${
              viewMode === 'block'
                ? 'bg-white text-brand-primary shadow-sm border border-brand-border'
                : 'text-brand-muted hover:text-brand-primary'
            }`}
            title="Block View"
          >
            <LayoutGrid size={18} />
          </button>
        </div>
      </div>

      {/* Content */}
      {viewMode === 'list' ? (
        // LIST VIEW
        <div className="overflow-x-auto flex-1">
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
                      {editingId === asset.id ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={editingTitle}
                            onChange={(e) => setEditingTitle(e.target.value)}
                            className="flex-1 px-2 py-1 border border-brand-border rounded text-sm focus:ring-2 focus:ring-brand-primary outline-none"
                            autoFocus
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') saveEdit(asset.id);
                              if (e.key === 'Escape') cancelEdit();
                            }}
                          />
                          <button
                            onClick={() => saveEdit(asset.id)}
                            disabled={isSaving}
                            className="p-1 text-brand-success hover:bg-brand-success/10 rounded transition-all"
                            title="Save"
                          >
                            <Save size={16} />
                          </button>
                          <button
                            onClick={cancelEdit}
                            disabled={isSaving}
                            className="p-1 text-brand-muted hover:text-brand-danger rounded transition-all"
                            title="Cancel"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ) : (
                        <p
                          className="font-semibold text-brand-primary text-sm line-clamp-1 cursor-pointer hover:text-brand-secondary transition-colors"
                          onClick={() => startEdit(asset)}
                          title="Click to edit"
                        >
                          {asset.title}
                        </p>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          asset.type === 'video'
                            ? 'bg-brand-secondary/10 text-brand-secondary'
                            : 'bg-brand-primary/10 text-brand-primary'
                        }`}
                      >
                        {asset.type}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 max-w-[200px]">
                        <code className="text-[10px] bg-brand-bg px-1.5 py-0.5 rounded text-brand-muted truncate">
                          {asset.branded_url}
                        </code>
                        <a
                          href={asset.branded_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-brand-muted hover:text-brand-primary"
                        >
                          <ExternalLink size={12} />
                        </a>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs text-brand-muted whitespace-nowrap">
                      {new Date(asset.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => startDelete(asset)}
                          className="inline-flex items-center gap-1 text-brand-danger hover:bg-brand-danger hover:text-white px-3 py-1.5 rounded-md text-xs font-semibold transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={14} />
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      ) : (
        // BLOCK VIEW
        <div className="flex-1 overflow-y-auto">
          {assets.length === 0 ? (
            <div className="text-center py-10 text-brand-muted">No media found.</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {assets.map((asset) => (
                <div
                  key={asset.id}
                  className="bg-white border border-brand-border rounded-lg overflow-hidden hover:shadow-lg transition-shadow group"
                >
                  {/* Image/Video Preview */}
                  <div className="relative h-32 bg-gray-100 overflow-hidden">
                    <Image
                      src={asset.branded_url}
                      alt={asset.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform"
                    />
                    <div className="absolute top-2 right-2">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          asset.type === 'video'
                            ? 'bg-brand-secondary/90 text-white'
                            : 'bg-brand-primary/90 text-white'
                        }`}
                      >
                        {asset.type}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-4 space-y-3">
                    {/* Title */}
                    {editingId === asset.id ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={editingTitle}
                          onChange={(e) => setEditingTitle(e.target.value)}
                          className="flex-1 px-2 py-1 border border-brand-border rounded text-sm focus:ring-2 focus:ring-brand-primary outline-none"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') saveEdit(asset.id);
                            if (e.key === 'Escape') cancelEdit();
                          }}
                        />
                      </div>
                    ) : (
                      <div
                        onClick={() => startEdit(asset)}
                        className="cursor-pointer"
                        title="Click to edit"
                      >
                        <p className="font-bold text-brand-primary text-sm line-clamp-2 hover:text-brand-secondary transition-colors">
                          {asset.title}
                        </p>
                      </div>
                    )}

                    {/* Metadata */}
                    <div className="text-xs text-brand-muted space-y-1">
                      <p className="truncate">{asset.branded_url}</p>
                      <p>{new Date(asset.created_at).toLocaleDateString()}</p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 pt-2 border-t border-brand-border">
                      {editingId === asset.id ? (
                        <>
                          <button
                            onClick={() => saveEdit(asset.id)}
                            disabled={isSaving}
                            className="flex-1 inline-flex items-center justify-center gap-1 text-white bg-brand-success hover:bg-opacity-90 px-2 py-1.5 rounded text-xs font-semibold transition-colors disabled:opacity-50"
                            title="Save"
                          >
                            <Save size={12} />
                            Save
                          </button>
                          <button
                            onClick={cancelEdit}
                            disabled={isSaving}
                            className="flex-1 inline-flex items-center justify-center gap-1 text-brand-muted hover:text-brand-danger px-2 py-1.5 rounded text-xs font-semibold transition-colors"
                            title="Cancel"
                          >
                            <X size={12} />
                            Cancel
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => startDelete(asset)}
                          className="w-full inline-flex items-center justify-center gap-1 text-white bg-brand-danger hover:bg-opacity-90 px-2 py-1.5 rounded text-xs font-semibold transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={12} />
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Pagination Bar */}
      {totalPages > 1 && (
        <div className="px-6 py-4 border-t border-brand-border bg-white flex items-center justify-between rounded-b-lg">
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

      {/* Delete Confirmation Modal */}
      {deletingAsset && (
        <DeleteConfirmModal
          asset={deletingAsset}
          onConfirm={confirmDelete}
          onCancel={() => setDeletingAsset(null)}
        />
      )}
    </div>
  );
}
