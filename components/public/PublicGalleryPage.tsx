'use client';

import Link from 'next/link';
import { CATEGORY_PRESETS, formatCategoryLabel } from '@/lib/categories';
import { MediaType, SanitizedMediaAsset } from '@/types';
import MediaGrid from './MediaGrid';
import RequestAssetModal from './RequestAssetModal';
import { useState } from 'react';

interface PublicGalleryPageProps {
  type: MediaType;
  title: string;
  description: string;
  total: number;
  assets: SanitizedMediaAsset[];
  basePath: '/images' | '/videos';
  crossNavHref: '/images' | '/videos';
  crossNavLabel: string;
  crossNavIcon: string;
  searchQuery: string;
  categoryFilter: string;
  hasFilters: boolean;
  searchPlaceholder: string;
  paginationLinks: Array<{ page: number; href: string }>;
  currentPage: number;
}

export default function PublicGalleryPage({
  type,
  title,
  description,
  total,
  assets,
  basePath,
  crossNavHref,
  crossNavLabel,
  crossNavIcon,
  searchQuery,
  categoryFilter,
  hasFilters,
  searchPlaceholder,
  paginationLinks,
  currentPage,
}: PublicGalleryPageProps) {
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const containerClass = type === 'image' ? 'legacy-gallery-container' : 'legacy-library-container';
  const headingClass = type === 'image' ? 'legacy-gallery-heading' : 'legacy-library-heading';
  const emptyMessage = hasFilters
    ? `No ${type === 'image' ? 'images' : 'videos'} found matching your search.`
    : `No ${type === 'image' ? 'images' : 'videos'} have been added yet.`;

  return (
    <div className={containerClass}>
      <div className={type === 'image' ? 'legacy-gallery-header' : 'legacy-library-header'}>
        <div className="legacy-title-section">
          <h1 className={headingClass}>{title}</h1>
          <p className="legacy-title-copy">{description}</p>
        </div>
        <div className="legacy-header-actions">
          <p className="legacy-header-meta">
            Showing {assets.length} of {total} {type === 'image' ? 'images' : 'videos'}
          </p>
          <Link href={crossNavHref} className="legacy-btn-cross-nav">
            <span>{crossNavIcon}</span>
            {crossNavLabel}
          </Link>
        </div>
      </div>

      <div className="legacy-search-wrapper">
        <form action={basePath} method="GET" className="legacy-search-container">
          <div className="legacy-search-input-wrapper">
            <span className="legacy-search-icon" aria-hidden="true">
              🔍
            </span>
            <input
              type="search"
              name="q"
              defaultValue={searchQuery}
              placeholder={searchPlaceholder}
              className="legacy-search-input"
            />
          </div>
          <select
            name="category"
            defaultValue={categoryFilter}
            className="legacy-category-filter"
          >
            <option value="all">All Categories</option>
            {CATEGORY_PRESETS.map((category) => (
              <option key={category} value={category}>
                {formatCategoryLabel(category)}
              </option>
            ))}
          </select>
          <button type="submit" className="legacy-btn-search">
            Search
          </button>
        </form>

        <div className="legacy-header-actions">
          {hasFilters ? (
            <Link href={basePath} className="legacy-clear-link">
              Clear filters
            </Link>
          ) : (
            <span className="legacy-clear-link" />
          )}
          <button
            type="button"
            className="legacy-btn-secondary"
            onClick={() => setIsRequestModalOpen(true)}
          >
            Request Missing Asset
          </button>
        </div>
      </div>

      <MediaGrid
        type={type}
        assets={assets}
        emptyMessage={emptyMessage}
        emptyActionLabel="Didn't find what you're looking for? Request it."
        onEmptyAction={() => setIsRequestModalOpen(true)}
      />

      {paginationLinks.length > 1 ? (
        <nav className="legacy-pagination" aria-label="Pagination">
          {paginationLinks.map((link) => (
            <Link
              key={link.page}
              href={link.href}
              className={`legacy-pagination-link${link.page === currentPage ? ' is-active' : ''}`}
              aria-current={link.page === currentPage ? 'page' : undefined}
            >
              {link.page}
            </Link>
          ))}
        </nav>
      ) : null}

      {isRequestModalOpen ? (
        <RequestAssetModal
          initialQuery={searchQuery}
          initialType={type}
          onClose={() => setIsRequestModalOpen(false)}
        />
      ) : null}
    </div>
  );
}
