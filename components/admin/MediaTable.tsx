'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ExternalLink, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Trash2, LayoutList, LayoutGrid, Save, X, Film, Image as ImageIcon } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { MediaAsset } from '@/types';
import { getVideoThumbnailUrl, formatDate } from '@/lib/utils';
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
  type?: 'image' | 'video';
  imageTotalCount: number;
  videoTotalCount: number;
}

type ViewMode = 'list' | 'block';
const CREATE_NEW_CATEGORY_OPTION = '__create_new_category__';

export default function MediaTable({ assets: initialAssets, total, page, type, imageTotalCount, videoTotalCount }: MediaTableProps) {
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

  // Reset state when page changes to ensure fresh data is displayed
  useEffect(() => {
    setAssets(initialAssets);
    setEditingId(null);
    setEditingTitle('');
    setAssigningCategoryId(null);
    setSelectedCategory(DEFAULT_CATEGORY_SLUG);
    setIsCreatingCategory(false);
    setNewCategoryInput('');
  }, [page, initialAssets]);

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
      {/* Header with Filter Tabs */}
      <div className="bg-white border border-brand-border rounded-xl p-4 sm:p-5 md:p-6">
        <div className="flex flex-col gap-4">
          {/* Header Row: Title + View Toggle */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-brand-primary">Media Library</h3>
              <p className="text-sm text-brand-muted mt-1">
                Total <span className="font-semibold">{assets.length}</span> of <span className="font-semibold">{total}</span> items
              </p>
            </div>
            <div className="flex items-center gap-2 bg-brand-bg p-1.5 rounded-lg border border-brand-border">
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

          {/* Filter Tabs */}
          <div className="flex items-center gap-2 border-t border-brand-border pt-4">
            <Link
              href="/admin"
              className={`px-4 py-2.5 rounded-lg font-semibold text-sm transition-all duration-200 whitespace-nowrap ${
                !type
                  ? 'bg-brand-primary text-white shadow-md'
                  : 'bg-brand-bg border border-brand-border text-brand-muted hover:text-brand-primary hover:border-brand-primary'
              }`}
            >
              All Media
              <span className="ml-2 font-bold opacity-75">({imageTotalCount + videoTotalCount})</span>
            </Link>
            <Link
              href="/admin?type=image"
              className={`px-4 py-2.5 rounded-lg font-semibold text-sm transition-all duration-200 flex items-center gap-2 whitespace-nowrap ${
                type === 'image'
                  ? 'bg-blue-500 text-white shadow-md'
                  : 'bg-brand-bg border border-brand-border text-brand-muted hover:text-blue-500 hover:border-blue-500'
              }`}
            >
              <ImageIcon size={16} />
              Images
              <span className="font-bold opacity-75">({imageTotalCount})</span>
            </Link>
            <Link
              href="/admin?type=video"
              className={`px-4 py-2.5 rounded-lg font-semibold text-sm transition-all duration-200 flex items-center gap-2 whitespace-nowrap ${
                type === 'video'
                  ? 'bg-brand-secondary text-white shadow-md'
                  : 'bg-brand-bg border border-brand-border text-brand-muted hover:text-brand-secondary hover:border-brand-secondary'
              }`}
            >
              <Film size={16} />
              Videos
              <span className="font-bold opacity-75">({videoTotalCount})</span>
            </Link>
          </div>
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
        <div className="flex-1 overflow-y-auto px-2 sm:px-4 md:px-6 lg:px-8 py-4">
          {assets.length === 0 ? (
            <div className="text-center py-12 text-brand-muted text-sm">No media found.</div>
          ) : (
            <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-5 2xl:grid-cols-6 gap-3 sm:gap-4 md:gap-5 auto-rows-max">
              {assets.map((asset) => (
                <div
                  key={asset.id}
                  className="bg-white border border-brand-border rounded-xl overflow-hidden hover:border-brand-primary hover:shadow-xl transition-all duration-300 flex flex-col h-full group"
                >
                  {/* Image/Video Preview - Smaller aspect ratio matching public view */}
                  <div className="relative w-full aspect-video bg-gray-100 overflow-hidden flex-shrink-0">
                    <Image
                      src={getDisplayUrl(asset)}
                      alt={asset.title}
                      fill
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, (max-width: 1280px) 20vw, 16vw"
                      unoptimized={asset.type === 'video'}
                    />
                    <div className="absolute top-2 right-2">
                      <span
                        className={`px-2 py-1 rounded-md text-[10px] font-extrabold uppercase tracking-wider shadow-md backdrop-blur-sm ${
                          asset.type === 'video'
                            ? 'bg-brand-secondary/95 text-white'
                            : 'bg-brand-primary/95 text-white'
                        }`}
                      >
                        {asset.type}
                      </span>
                    </div>
                  </div>

                  {/* Content - Fills remaining space */}
                  <div className="p-3 sm:p-4 flex flex-col flex-1 space-y-2.5">
                    {/* Title */}
                    {editingId === asset.id ? (
                      <div className="flex items-center gap-1.5">
                        <input
                          type="text"
                          value={editingTitle}
                          onChange={(e) => setEditingTitle(e.target.value)}
                          className="flex-1 px-2 py-1 border border-brand-border rounded-md text-xs focus:ring-2 focus:ring-brand-primary focus:border-transparent outline-none transition-all"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') saveEdit(asset.id);
                            if (e.key === 'Escape') cancelEdit();
                          }}
                        />
                      </div>
                    ) : (
                      <div className="flex-1">
                        <p className="font-bold text-brand-primary text-sm line-clamp-2 leading-snug">
                          {asset.title}
                        </p>
                      </div>
                    )}

                    {/* Metadata */}
                    <div className="text-xs text-brand-muted space-y-1.5">
                      <span
                        className={`inline-flex px-2 py-1 rounded-md text-[10px] font-extrabold uppercase tracking-tight ${getCategoryBadgeClass(asset.category_slug)}`}
                      >
                        {formatCategoryLabel(asset.category_slug)}
                      </span>
                      <p className="truncate text-[11px] text-brand-muted/80">{formatDate(asset.created_at)}</p>
                    </div>

                    {/* Spacer */}
                    <div className="flex-1"></div>

                    {/* Edit Mode - Save/Cancel */}
                    {editingId === asset.id ? (
                      <div className="flex items-center gap-2 border-t border-brand-border pt-3">
                        <button
                          onClick={() => saveEdit(asset.id)}
                          disabled={isSaving}
                          className="flex-1 inline-flex items-center justify-center gap-1 text-white bg-brand-success hover:bg-brand-success/90 px-2 py-1.5 rounded-md text-xs font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Save"
                        >
                          <Save size={14} />
                          <span className="hidden sm:inline">Save</span>
                        </button>
                        <button
                          onClick={cancelEdit}
                          disabled={isSaving}
                          className="flex-1 inline-flex items-center justify-center gap-1 text-white bg-gray-400 hover:bg-gray-500 px-2 py-1.5 rounded-md text-xs font-semibold transition-all duration-200"
                          title="Cancel"
                        >
                          <X size={14} />
                          <span className="hidden sm:inline">Cancel</span>
                        </button>
                      </div>
                    ) : assigningCategoryId === asset.id ? (
                      /* Category Selection Mode */
                      <div className="border-t border-brand-border pt-3 space-y-2">
                        <select
                          value={selectedCategory}
                          onChange={(e) => onCategoryOptionChange(e.target.value)}
                          className="w-full px-2 py-1.5 border border-brand-border rounded-md text-xs focus:ring-2 focus:ring-brand-primary focus:border-transparent outline-none transition-all bg-white"
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
                            className="w-full px-2 py-1.5 border border-brand-border rounded-md text-xs focus:ring-2 focus:ring-brand-primary focus:border-transparent outline-none transition-all"
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
                            className="flex-1 inline-flex items-center justify-center text-white bg-brand-success hover:bg-brand-success/90 px-2 py-1.5 rounded-md text-xs font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Save
                          </button>
                          <button
                            onClick={cancelAssignCategory}
                            disabled={isAssigningCategory}
                            className="flex-1 inline-flex items-center justify-center text-white bg-gray-400 hover:bg-gray-500 px-2 py-1.5 rounded-md text-xs font-semibold transition-all duration-200"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* Normal Mode - Action Buttons */
                      <div className="grid grid-cols-3 gap-2 border-t border-brand-border pt-3">
                        <button
                          onClick={() => startEdit(asset)}
                          disabled={isSaving}
                          className="inline-flex items-center justify-center text-brand-primary bg-brand-primary/10 hover:bg-brand-primary hover:text-white px-2 py-1.5 rounded-md text-xs font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Rename"
                        >
                          Rename
                        </button>
                        <button
                          onClick={() => startAssignCategory(asset)}
                          disabled={isAssigningCategory}
                          className="inline-flex items-center justify-center text-brand-secondary bg-brand-secondary/10 hover:bg-brand-secondary hover:text-white px-2 py-1.5 rounded-md text-xs font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Assign category"
                        >
                          Category
                        </button>
                        <button
                          onClick={() => startDelete(asset)}
                          disabled={isDeleting}
                          className="inline-flex items-center justify-center gap-1 text-white bg-brand-danger hover:bg-brand-danger/90 px-2 py-1.5 rounded-md text-xs font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Delete"
                        >
                          <Trash2 size={14} />
                          <span className="hidden sm:inline">Delete</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Pagination Bar */}
      {totalPages > 1 && (
        <div className="px-2 sm:px-4 md:px-6 py-5 border-t border-brand-border bg-white flex items-center justify-between rounded-b-lg">
          <p className="text-xs md:text-sm text-brand-muted font-medium">
            Page <span className="font-bold text-brand-primary">{page}</span> out of <span className="font-bold">{totalPages}</span> • <span className="text-brand-primary font-bold">{total}</span> items
          </p>
          <div className="flex items-center gap-1 sm:gap-2">
            <Link
              href={`/admin${type ? `?type=${type}` : ''}`}
              className={`p-2.5 rounded-lg border border-brand-border hover:border-brand-primary hover:bg-brand-primary/5 transition-all duration-200 ${
                page <= 1 ? 'pointer-events-none opacity-30 cursor-not-allowed' : 'hover:shadow-md'
              }`}
              title="First page"
            >
              <ChevronsLeft size={18} />
            </Link>
            <Link
              href={`/admin?page=${page - 1}${type ? `&type=${type}` : ''}`}
              className={`p-2.5 rounded-lg border border-brand-border hover:border-brand-primary hover:bg-brand-primary/5 transition-all duration-200 ${
                page <= 1 ? 'pointer-events-none opacity-30 cursor-not-allowed' : 'hover:shadow-md'
              }`}
              title="Previous page"
            >
              <ChevronLeft size={18} />
            </Link>
            <Link
              href={`/admin?page=${page + 1}${type ? `&type=${type}` : ''}`}
              className={`p-2.5 rounded-lg border border-brand-border hover:border-brand-primary hover:bg-brand-primary/5 transition-all duration-200 ${
                page >= totalPages ? 'pointer-events-none opacity-30 cursor-not-allowed' : 'hover:shadow-md'
              }`}
              title="Next page"
            >
              <ChevronRight size={18} />
            </Link>
            <Link
              href={`/admin?page=${totalPages}${type ? `&type=${type}` : ''}`}
              className={`p-2.5 rounded-lg border border-brand-border hover:border-brand-primary hover:bg-brand-primary/5 transition-all duration-200 ${
                page >= totalPages ? 'pointer-events-none opacity-30 cursor-not-allowed' : 'hover:shadow-md'
              }`}
              title="Last page"
            >
              <ChevronsRight size={18} />
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
