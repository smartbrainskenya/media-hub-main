export const DEFAULT_CATEGORY_SLUG = 'uncategorized';

export const CATEGORY_PRESETS = [
  'uncategorized',
  'education',
  'music',
  'entertainment',
  'nature',
  'technology',
  'sports',
] as const;

const CATEGORY_COLOR_MAP: Record<string, string> = {
  uncategorized: 'bg-slate-100 text-slate-700',
  education: 'bg-emerald-100 text-emerald-700',
  music: 'bg-cyan-100 text-cyan-700',
  entertainment: 'bg-orange-100 text-orange-700',
  nature: 'bg-lime-100 text-lime-700',
  technology: 'bg-indigo-100 text-indigo-700',
  sports: 'bg-amber-100 text-amber-700',
};

export function normalizeCategorySlug(value: string | null | undefined): string {
  if (!value) return DEFAULT_CATEGORY_SLUG;

  const normalized = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

  return normalized || DEFAULT_CATEGORY_SLUG;
}

export function formatCategoryLabel(value: string | null | undefined): string {
  const slug = normalizeCategorySlug(value);
  return slug
    .split('-')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

export function getCategoryBadgeClass(value: string | null | undefined): string {
  const slug = normalizeCategorySlug(value);
  return CATEGORY_COLOR_MAP[slug] || 'bg-teal-100 text-teal-700';
}
