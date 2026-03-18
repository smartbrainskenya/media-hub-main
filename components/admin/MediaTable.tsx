'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ExternalLink, ChevronLeft, ChevronRight, Trash2, LayoutList, LayoutGrid, Save, X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { MediaAsset } from '@/types';
import { getVideoThumbnailUrl, formatDate, calculateAspectRatio } from '@/lib/utils';
import DeleteConfirmModal from './DeleteConfirmModal';
import {
  CATEGORY_PRESETS,
  DEFAULT_CATEGORY_SLUG,
  formatCategoryLabel,
  getCategoryBadgeClass,
  normalizeCategorySlug,
} from '@/lib/categories';

interface MediaTableProps {
  assets: MediaAsset[];
  total: number;
  page: number;
}

type ViewMode = 'list' | 'block';
const CREATE_NEW_CATEGORY_OPTION = '__create_new_category__';

export default function MediaTable({ assets: initialAssets, total, page }: MediaTableProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [assets, setAssets] = useState(initialAssets);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [deletingAsset, setDeletingAsset] = useState<MediaAsset | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [assigningCategoryId, setAssigningCategoryId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState(DEFAULT_CATEGORY_SLUG);
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [newCategoryInput, setNewCategoryInput] = useState('');
  const [isAssigningCategory, setIsAssigningCategory] = useState(false);

  const perPage = 20;
  const totalPages = Math.ceil(total / perPage);
  const presetCategories = [...CATEGORY_PRESETS];
  const presetCategorySet = new Set<string>(presetCategories);
  const customCategories = Array.from(
    new Set(
      assets
        .map((asset) => normalizeCategorySlug(asset.category_slug))
        .filter((slug) => !presetCategorySet.has(slug))
    )
  ).sort((a, b) => a.localeCompare(b));
  const categoryOptions = [...presetCategories, ...customCategories];

  /**
   * Get display URL for admin preview:
   * - For videos: use auto-generated JPEG thumbnail
   * - For images: use the original preview URL
   */
  const getDisplayUrl = (asset: MediaAsset): string => {
    if (asset.type === 'video') {
      return getVideoThumbnailUrl(asset.branded_url);
    }
    return asset.branded_url;
  };

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

      await res.json();
      
      // Update local state
      setAssets((prev) =>
        prev.map((a) => (a.id === assetId ? { ...a, title: editingTitle.trim() } : a))
      );

      toast.success('Title updated successfully');
      setEditingId(null);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update title';
      toast.error(`Failed to update title: ${errorMessage}`);
    } finally {
      setIsSaving(false);
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingTitle('');
  };

  const startAssignCategory = (asset: MediaAsset) => {
    const currentCategory = normalizeCategorySlug(asset.category_slug);
    const isKnownCategory = categoryOptions.includes(currentCategory);

    setAssigningCategoryId(asset.id);
    setSelectedCategory(isKnownCategory ? currentCategory : CREATE_NEW_CATEGORY_OPTION);
    setIsCreatingCategory(!isKnownCategory);
    setNewCategoryInput(!isKnownCategory ? currentCategory : '');
  };

  const cancelAssignCategory = () => {
    setAssigningCategoryId(null);
    setSelectedCategory(DEFAULT_CATEGORY_SLUG);
    setIsCreatingCategory(false);
    setNewCategoryInput('');
  };

  const saveCategory = async (assetId: string) => {
    if (isCreatingCategory && !newCategoryInput.trim()) {
      toast.error('Enter a category name');
      return;
    }

    const nextCategory = normalizeCategorySlug(
      isCreatingCategory ? newCategoryInput : selectedCategory
    );

    setIsAssigningCategory(true);
    try {
      const res = await fetch(`/api/media/${assetId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category_slug: nextCategory }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || `HTTP ${res.status}`);
      }

      await res.json();

      setAssets((prev) =>
        prev.map((a) => (a.id === assetId ? { ...a, category_slug: nextCategory } : a))
      );

      toast.success('Category assigned successfully');
      cancelAssignCategory();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to assign category';
      toast.error(`Failed to assign category: ${errorMessage}`);
    } finally {
      setIsAssigningCategory(false);
    }
  };

  const onCategoryOptionChange = (value: string) => {
    if (value === CREATE_NEW_CATEGORY_OPTION) {
      setSelectedCategory(value);
      setIsCreatingCategory(true);
      return;
    }

    setSelectedCategory(value);
    setIsCreatingCategory(false);
    setNewCategoryInput('');
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
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete media';
      toast.error(`Failed to delete media: ${errorMessage}`);
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
                <th className="px-6 py-4 font-bold">Category</th>
                <th className="px-6 py-4 font-bold">URL</th>
                <th className="px-6 py-4 font-bold">Date</th>
                <th className="px-6 py-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border">
              {assets.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center text-brand-muted">
                    No media found.
                  </td>
                </tr>
              ) : (
                assets.map((asset) => (
                  <tr key={asset.id} className="hover:bg-brand-bg/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="relative h-12 w-20 rounded-md overflow-hidden bg-gray-100 border border-brand-border">
                        <Image
                          src={getDisplayUrl(asset)}
                          alt={asset.title}
                          fill
                          className="object-cover"
                          sizes="80px"
                          unoptimized={asset.type === 'video'}
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
                      {assigningCategoryId === asset.id ? (
                        <div className="flex items-center gap-2">
                          <select
                            value={selectedCategory}
                            onChange={(e) => onCategoryOptionChange(e.target.value)}
                            className="w-44 px-2 py-1 border border-brand-border rounded text-xs focus:ring-2 focus:ring-brand-primary outline-none"
                            disabled={isAssigningCategory}
                            autoFocus
                          >
                            {categoryOptions.map((category) => (
                              <option key={category} value={category}>
                                {formatCategoryLabel(category)}
                              </option>
                            ))}
                            <option value={CREATE_NEW_CATEGORY_OPTION}>+ Create New Category</option>
                          </select>
                          {isCreatingCategory && (
                            <input
                              type="text"
                              value={newCategoryInput}
                              onChange={(e) => setNewCategoryInput(e.target.value)}
                              className="w-36 px-2 py-1 border border-brand-border rounded text-xs focus:ring-2 focus:ring-brand-primary outline-none"
                              placeholder="New category"
                              disabled={isAssigningCategory}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') saveCategory(asset.id);
                                if (e.key === 'Escape') cancelAssignCategory();
                              }}
                            />
                          )}
                          <button
                            onClick={() => saveCategory(asset.id)}
                            disabled={isAssigningCategory}
                            className="p-1 text-brand-success hover:bg-brand-success/10 rounded transition-all"
                            title="Save category"
                          >
                            <Save size={16} />
                          </button>
                          <button
                            onClick={cancelAssignCategory}
                            disabled={isAssigningCategory}
                            className="p-1 text-brand-muted hover:text-brand-danger rounded transition-all"
                            title="Cancel category edit"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ) : (
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${getCategoryBadgeClass(asset.category_slug)}`}
                        >
                          {formatCategoryLabel(asset.category_slug)}
                        </span>
                      )}
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
                      {formatDate(asset.created_at)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => startAssignCategory(asset)}
                          disabled={isAssigningCategory}
                          className="inline-flex items-center gap-1 text-brand-primary hover:bg-brand-primary hover:text-white px-3 py-1.5 rounded-md text-xs font-semibold transition-colors disabled:opacity-50"
                          title="Assign category"
                        >
                          Assign Category
                        </button>
                        <button
                          onClick={() => startDelete(asset)}
                          disabled={isDeleting}
                          className="inline-flex items-center gap-1 text-brand-danger hover:bg-brand-danger hover:text-white px-3 py-1.5 rounded-md text-xs font-semibold transition-colors disabled:opacity-50"
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
              {assets.map((asset) => {
                const aspectRatio = calculateAspectRatio(asset.width_px, asset.height_px);
                return (
                <div
                  key={asset.id}
                  className="bg-white border border-brand-border rounded-lg overflow-hidden hover:shadow-lg transition-shadow group"
                >
                  {/* Image/Video Preview */}
                  <div className="relative w-full bg-gray-100 overflow-hidden flex-shrink-0" style={{ aspectRatio: aspectRatio.aspectRatioCss } as React.CSSProperties}>
                    <Image
                      src={getDisplayUrl(asset)}
                      alt={asset.title}
                      fill
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      unoptimized={asset.type === 'video'}
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
                      <span
                        className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${getCategoryBadgeClass(asset.category_slug)}`}
                      >
                        {formatCategoryLabel(asset.category_slug)}
                      </span>
                      <p className="truncate">{asset.branded_url}</p>
                      <p>{formatDate(asset.created_at)}</p>
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
                        <>
                          <button
                            onClick={() => startAssignCategory(asset)}
                            disabled={isAssigningCategory}
                            className="flex-1 inline-flex items-center justify-center text-brand-primary bg-brand-primary/10 hover:bg-brand-primary hover:text-white px-2 py-1.5 rounded text-xs font-semibold transition-colors disabled:opacity-50"
                            title="Assign category"
                          >
                            Assign Category
                          </button>
                          <button
                            onClick={() => startDelete(asset)}
                            disabled={isDeleting}
                            className="flex-1 inline-flex items-center justify-center gap-1 text-white bg-brand-danger hover:bg-opacity-90 px-2 py-1.5 rounded text-xs font-semibold transition-colors disabled:opacity-50"
                            title="Delete"
                          >
                            <Trash2 size={12} />
                            Delete
                          </button>
                        </>
                      )}
                    </div>
                    {assigningCategoryId === asset.id && (
                      <div className="pt-2 border-t border-brand-border space-y-2">
                        <select
                          value={selectedCategory}
                          onChange={(e) => onCategoryOptionChange(e.target.value)}
                          className="w-full px-2 py-1 border border-brand-border rounded text-xs focus:ring-2 focus:ring-brand-primary outline-none"
                          disabled={isAssigningCategory}
                        >
                          {categoryOptions.map((category) => (
                            <option key={category} value={category}>
                              {formatCategoryLabel(category)}
                            </option>
                          ))}
                          <option value={CREATE_NEW_CATEGORY_OPTION}>+ Create New Category</option>
                        </select>
                        {isCreatingCategory && (
                          <input
                            type="text"
                            value={newCategoryInput}
                            onChange={(e) => setNewCategoryInput(e.target.value)}
                            className="w-full px-2 py-1 border border-brand-border rounded text-xs focus:ring-2 focus:ring-brand-primary outline-none"
                            placeholder="New category"
                            disabled={isAssigningCategory}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') saveCategory(asset.id);
                              if (e.key === 'Escape') cancelAssignCategory();
                            }}
                          />
                        )}
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => saveCategory(asset.id)}
                            disabled={isAssigningCategory}
                            className="flex-1 inline-flex items-center justify-center text-white bg-brand-success hover:bg-opacity-90 px-2 py-1.5 rounded text-xs font-semibold transition-colors disabled:opacity-50"
                          >
                            Save Category
                          </button>
                          <button
                            onClick={cancelAssignCategory}
                            disabled={isAssigningCategory}
                            className="flex-1 inline-flex items-center justify-center text-brand-muted hover:text-brand-danger px-2 py-1.5 rounded text-xs font-semibold transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                );
              })}
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
