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
