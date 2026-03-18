import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Human-readable file size (e.g. "2.4 MB")
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * "mm:ss" format for duration
 */
export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Tailwind class merge utility
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Constructs a pure-client video thumbnail URL from a branded URL and Publitio ID
 */
export function getVideoThumbnailUrl(brandedUrl: string, publitioId?: string): string {
  if (!brandedUrl) return '';
  try {
    const url = new URL(brandedUrl);
    const origin = url.origin.endsWith('/') ? url.origin.slice(0, -1) : url.origin;
    if (publitioId) {
      return `${origin}/thumb/${publitioId}.jpg`;
    }
    // Fallback: replace the file extension with .jpg since publitio_id is removed in client APIs
    return brandedUrl.replace(/\.[^/.]+$/, '.jpg');
  } catch {
    return '';
  }
}
/**
 * Stable date formatter for hydration: "Nov 3, 2023"
 */
export function formatDate(date: string | number | Date): string {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

/**
 * Calculates smart aspect ratio based on media dimensions
 * @param width - image/video width in pixels
 * @param height - image/video height in pixels
 * @param breakpoint - optional breakpoint ('mobile', 'tablet', 'desktop')
 * @returns object with aspectRatio (as string) and CSS custom properties
 */
export interface AspectRatioResult {
  /** Tailwind aspect-ratio class or 'aspect-auto' */
  className: string;
  /** CSS custom property for aspect-ratio (e.g., "16 / 9") */
  aspectRatioCss: string;
  /** Calculated aspect ratio type */
  type: 'landscape' | 'portrait' | 'square';
}

export function calculateAspectRatio(
  width: number | null | undefined,
  height: number | null | undefined,
  breakpoint?: 'mobile' | 'tablet' | 'desktop'
): AspectRatioResult {
  // Fallback: no dimensions provided
  if (!width || !height) {
    return {
      className: 'aspect-video',
      aspectRatioCss: '16 / 9',
      type: 'landscape'
    };
  }

  const ratio = width / height;

  // Determine aspect ratio type
  let type: 'landscape' | 'portrait' | 'square';
  let className: string;
  let aspectRatioCss: string;

  if (ratio > 1.2) {
    // Landscape: 16:9
    type = 'landscape';
    className = 'aspect-video';
    aspectRatioCss = '16 / 9';
  } else if (ratio < 0.833) {
    // Portrait: 4:5 (0.8)
    type = 'portrait';
    className = 'aspect-[4/5]';
    aspectRatioCss = '4 / 5';
  } else {
    // Square: 1:1
    type = 'square';
    className = 'aspect-square';
    aspectRatioCss = '1 / 1';
  }

  // Mobile override: force square for gallery cards (optional behavior)
  if (breakpoint === 'mobile' && type !== 'portrait') {
    // For mobile, we might want to force square for uniformity in gallery
    // Keeping this flexible - can be controlled by component
  }

  return {
    className,
    aspectRatioCss,
    type
  };
}
