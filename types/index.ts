export type MediaType = 'image' | 'video';
export type AssetRequestStatus = 'pending' | 'fulfilled';
export type AssetRequestContext = 'project' | 'class';

export interface MediaAsset {
  id: string;
  publitio_id: string;
  title: string;
  type: MediaType;
  category_slug: string | null;
  branded_url: string;
  file_size_bytes: number | null;
  width_px: number | null;
  height_px: number | null;
  duration_secs: number | null;
  uploaded_by: string | null;
  created_at: string;
  updated_at: string;
}

export type SanitizedMediaAsset = Omit<MediaAsset, 'publitio_id'>;

export interface AdminUser {
  id: string;
  email: string;
  display_name: string;
  created_at: string;
}

export interface AuditLogEntry {
  id: string;
  admin_id: string;
  action: 'upload' | 'import' | 'rename' | 'replace' | 'delete';
  media_id: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  per_page: number;
}

export interface AssetRequest {
  id: string;
  query: string;
  type: MediaType;
  context: AssetRequestContext;
  note: string | null;
  status: AssetRequestStatus;
  created_at: string;
  updated_at: string;
}

export interface CreateAssetRequestInput {
  query: string;
  type: MediaType;
  context: AssetRequestContext;
  note?: string;
}

/**
 * Bulk upload types
 */
export interface BulkUploadFile {
  file: File;
  title: string;
  status: 'pending' | 'uploading' | 'done' | 'error';
  error?: string;
}

export interface FailedUpload {
  filename: string;
  error: string;
}

export interface UploadResult {
  successCount: number;
  failedUploads: FailedUpload[];
}
