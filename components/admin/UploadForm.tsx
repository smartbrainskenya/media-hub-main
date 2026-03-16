'use client';

import { useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { Upload, X, CheckCircle, AlertCircle, Loader2, RotateCcw } from 'lucide-react';
import { BulkUploadFile, FailedUpload } from '@/types';

export default function UploadForm() {
  const [files, setFiles] = useState<BulkUploadFile[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [isCancelled, setIsCancelled] = useState(false);
  const [failedUploads, setFailedUploads] = useState<FailedUpload[]>([]);
  const [uploadComplete, setUploadComplete] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const router = useRouter();

  // Generate title from filename (strip extension)
  const generateTitle = (filename: string): string => {
    return filename.replace(/\.[^/.]+$/, '');
  };

  // Handle file selection (multiple files)
  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (!selectedFiles) return;

    const newFiles: BulkUploadFile[] = [];

    for (let i = 0; i < selectedFiles.length; i++) {
      const file = selectedFiles[i];

      if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
        toast.error(`${file.name} is not a valid image or video`);
        continue;
      }

      // Check file size (500MB limit)
      if (file.size > 500 * 1024 * 1024) {
        toast.error(`${file.name} exceeds 500MB limit`);
        continue;
      }

      newFiles.push({
        file,
        title: generateTitle(file.name),
        status: 'pending',
      });
    }

    if (newFiles.length > 0) {
      setFiles((prev) => [...prev, ...newFiles]);
    }

    // Reset input so same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Remove a file from the list (before upload)
  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // Calculate total batch size
  const getTotalSize = (): number => {
    return files.reduce((sum, f) => sum + f.file.size, 0);
  };

  // Validate batch before upload
  const validateBatch = (): boolean => {
    if (files.length === 0) {
      toast.error('Please select at least one file');
      return false;
    }

    const totalSize = getTotalSize();
    const maxBatchSize = 2 * 1024 * 1024 * 1024; // 2GB

    if (totalSize > maxBatchSize) {
      const sizeGB = (totalSize / (1024 * 1024 * 1024)).toFixed(2);
      toast.error(`Batch size (${sizeGB}GB) exceeds 2GB limit`);
      return false;
    }

    return true;
  };

  // Upload files in parallel
  const uploadFilesParallel = useCallback(async () => {
    if (!validateBatch()) return;

    setIsUploading(true);
    setIsCancelled(false);
    setFailedUploads([]);
    setUploadProgress(0);

    // Create AbortController for cancellation
    abortControllerRef.current = new AbortController();

    // Update all files to 'uploading' status
    setFiles((prev) =>
      prev.map((f) => ({ ...f, status: 'uploading' }))
    );

    let successCount = 0;
    const failed: FailedUpload[] = [];

    try {
      // Upload all files in parallel
      const uploadPromises = files.map(async (fileData, index) => {
        try {
          const formData = new FormData();
          formData.append('file', fileData.file);
          formData.append('title', fileData.title);

          console.log(`[BULK_UPLOAD] Uploading file ${index + 1}/${files.length}:`, {
            filename: fileData.file.name,
            fileSize: (fileData.file.size / (1024 * 1024)).toFixed(2) + ' MB',
            title: fileData.title,
          });

          const res = await fetch('/api/upload', {
            method: 'POST',
            body: formData,
            signal: abortControllerRef.current?.signal,
          });

          if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            const errorMsg = errorData.error || `HTTP ${res.status}`;
            throw new Error(errorMsg);
          }

          const json = await res.json();

          if (!json?.data) {
            throw new Error(json?.error || 'No response data');
          }

          successCount++;

          // Update file status to 'done'
          setFiles((prev) =>
            prev.map((f, i) =>
              i === index ? { ...f, status: 'done' } : f
            )
          );

          console.log(`[BULK_UPLOAD] File ${index + 1} success:`, {
            assetId: json.data.id,
            title: json.data.title,
          });
        } catch (err: any) {
          const errorMsg = err.message || 'Upload failed';

          // Don't add to failed list if cancelled
          if (err.name !== 'AbortError' && !isCancelled) {
            failed.push({
              filename: fileData.file.name,
              error: errorMsg,
            });
          }

          // Update file status to 'error'
          setFiles((prev) =>
            prev.map((f, i) =>
              i === index ? { ...f, status: 'error', error: errorMsg } : f
            )
          );

          console.error(`[BULK_UPLOAD] File ${index + 1} error:`, errorMsg);
        }

        // Update progress after each file completes
        setUploadProgress((prev) => {
          const newProgress = Math.round(((successCount + failed.length) / files.length) * 100);
          return Math.max(prev, newProgress);
        });
      });

      await Promise.allSettled(uploadPromises);

      setFailedUploads(failed);
      setUploadComplete(true);

      // Auto-redirect if all succeeded
      if (failed.length === 0 && successCount > 0) {
        toast.success(`✓ All ${successCount} files uploaded successfully!`);
        setTimeout(() => {
          router.push('/admin');
          router.refresh();
        }, 2000);
      } else if (successCount > 0) {
        toast.success(`✓ ${successCount} files uploaded, ${failed.length} failed`);
      } else {
        toast.error(`✗ All ${files.length} uploads failed`);
      }
    } catch (err: any) {
      console.error('[BULK_UPLOAD] Error:', err);
      if (err.name !== 'AbortError') {
        toast.error(err.message || 'Upload process failed');
      }
    } finally {
      setIsUploading(false);
    }
  }, [files, isCancelled, router]);

  // Cancel uploads
  const handleCancel = () => {
    setIsCancelled(true);
    abortControllerRef.current?.abort();
    setIsUploading(false);
    toast.info('Upload cancelled');
  };

  // Retry failed files only
  const retryFailed = () => {
    const failedFiles = files.filter((f) => f.status === 'error');
    setFiles(failedFiles);
    setFailedUploads([]);
    setUploadComplete(false);
    setUploadProgress(0);
    uploadFilesParallel();
  };

  // Reset form
  const resetForm = () => {
    setFiles([]);
    setFailedUploads([]);
    setUploadComplete(false);
    setUploadProgress(0);
    setIsCancelled(false);
  };

  const totalSize = getTotalSize();
  const completedCount = files.filter((f) => f.status === 'done').length;
  const errorCount = files.filter((f) => f.status === 'error').length;

  return (
    <div className="max-w-4xl mx-auto">
      <form className="space-y-8 bg-white p-8 rounded-xl border border-brand-border shadow-sm">
        {/* File Dropzone */}
        <div
          onClick={() => !isUploading && fileInputRef.current?.click()}
          className={`
            border-2 border-dashed rounded-xl p-10 flex flex-col items-center justify-center transition-all cursor-pointer
            ${files.length > 0 ? 'border-brand-success bg-brand-success/5' : 'border-brand-border hover:border-brand-primary bg-brand-bg/50'}
            ${isUploading ? 'pointer-events-none opacity-60' : ''}
          `}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={onFileChange}
            className="hidden"
            accept="image/*,video/*"
            multiple
          />

          {files.length > 0 ? (
            <div className="flex flex-col items-center text-center">
              <div className="p-3 bg-brand-success/20 rounded-full mb-4">
                <CheckCircle className="h-10 w-10 text-brand-success" />
              </div>
              <p className="font-bold text-brand-primary">
                {files.length} file{files.length !== 1 ? 's' : ''} selected
              </p>
              <p className="text-xs text-brand-muted mt-1">
                {(totalSize / (1024 * 1024)).toFixed(2)} MB total
              </p>
              {!isUploading && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    resetForm();
                  }}
                  className="mt-4 text-xs font-bold text-brand-danger hover:underline flex items-center gap-1"
                >
                  <X size={12} /> Clear Selection
                </button>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center text-center">
              <div className="p-3 bg-brand-primary/10 rounded-full mb-4">
                <Upload className="h-10 w-10 text-brand-primary" />
              </div>
              <p className="font-bold text-brand-primary">Click to select files</p>
              <p className="text-xs text-brand-muted mt-1">
                Images or Videos (up to 100 files, max 2GB total)
              </p>
            </div>
          )}
        </div>

        {/* File list */}
        {files.length > 0 && (
          <div className="space-y-2">
            <div className="text-sm font-bold text-brand-primary">Files to upload:</div>
            <div className="max-h-40 overflow-y-auto space-y-1 border border-brand-border rounded-lg p-3 bg-brand-bg/50">
              {files.map((fileData, idx) => (
                <div
                  key={idx}
                  className={`flex items-center justify-between text-xs p-2 rounded ${
                    fileData.status === 'done'
                      ? 'bg-brand-success/10 text-brand-success'
                      : fileData.status === 'error'
                      ? 'bg-brand-danger/10 text-brand-danger'
                      : fileData.status === 'uploading'
                      ? 'bg-brand-primary/10 text-brand-primary'
                      : 'text-brand-text'
                  }`}
                >
                  <div className="flex-1 truncate">
                    <span className="font-bold">{fileData.title}</span>
                    <span className="text-brand-muted ml-1">
                      ({(fileData.file.size / (1024 * 1024)).toFixed(1)}MB)
                    </span>
                  </div>
                  <div className="flex items-center gap-2 ml-2">
                    {fileData.status === 'done' && <CheckCircle size={14} />}
                    {fileData.status === 'error' && <AlertCircle size={14} />}
                    {fileData.status === 'uploading' && (
                      <Loader2 size={14} className="animate-spin" />
                    )}
                    {!isUploading && fileData.status === 'pending' && (
                      <button
                        type="button"
                        onClick={() => removeFile(idx)}
                        className="text-brand-danger hover:text-brand-danger/70"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Progress bar */}
        {isUploading && (
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-bold text-brand-primary">
              <span>Uploading {completedCount} of {files.length} files...</span>
              <span>{uploadProgress}%</span>
            </div>
            <div className="w-full bg-brand-bg rounded-full h-2 overflow-hidden border border-brand-border">
              <div
                className="bg-brand-primary h-full transition-all duration-300 ease-out"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Failed uploads summary */}
        {uploadComplete && failedUploads.length > 0 && (
          <div className="bg-brand-danger/10 border border-brand-danger/20 rounded-lg p-4 space-y-2">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-brand-danger" />
              <p className="font-bold text-brand-danger">
                {failedUploads.length} file{failedUploads.length !== 1 ? 's' : ''} failed to upload
              </p>
            </div>
            <ul className="text-xs text-brand-text space-y-1 ml-7">
              {failedUploads.map((failed, idx) => (
                <li key={idx}>
                  <span className="font-medium">{failed.filename}</span>: {failed.error}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Success summary */}
        {uploadComplete && errorCount === 0 && completedCount > 0 && (
          <div className="bg-brand-success/10 border border-brand-success/20 rounded-lg p-4 flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-brand-success flex-shrink-0" />
            <p className="text-sm font-bold text-brand-success">
              ✓ All {completedCount} files uploaded successfully!
            </p>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex gap-3">
          {isUploading ? (
            <button
              type="button"
              onClick={handleCancel}
              className="flex-1 py-4 bg-brand-danger text-white font-bold rounded-lg shadow-lg shadow-brand-danger/20 hover:bg-opacity-90 transition-all flex items-center justify-center gap-2"
            >
              <X className="h-5 w-5" />
              Cancel Upload
            </button>
          ) : uploadComplete && failedUploads.length > 0 ? (
            <>
              <button
                type="button"
                onClick={retryFailed}
                className="flex-1 py-4 bg-brand-primary text-white font-bold rounded-lg shadow-lg shadow-brand-primary/20 hover:bg-opacity-90 transition-all flex items-center justify-center gap-2"
              >
                <RotateCcw className="h-5 w-5" />
                Retry Failed Files
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="flex-1 py-4 bg-brand-secondary text-white font-bold rounded-lg shadow-lg shadow-brand-secondary/20 hover:bg-opacity-90 transition-all flex items-center justify-center gap-2"
              >
                Upload More
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={uploadFilesParallel}
                disabled={files.length === 0}
                className="flex-1 py-4 bg-brand-primary text-white font-bold rounded-lg shadow-lg shadow-brand-primary/20 hover:bg-opacity-90 disabled:opacity-50 disabled:shadow-none transition-all flex items-center justify-center gap-2"
              >
                <Upload className="h-5 w-5" />
                Start Upload
              </button>
              {uploadComplete && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 py-4 bg-brand-secondary text-white font-bold rounded-lg shadow-lg shadow-brand-secondary/20 hover:bg-opacity-90 transition-all flex items-center justify-center gap-2"
                >
                  Upload More
                </button>
              )}
            </>
          )}
        </div>
      </form>
    </div>
  );
}
