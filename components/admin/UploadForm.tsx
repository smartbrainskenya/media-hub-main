'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'react-hot-toast';
import { Upload, File, X, CheckCircle, Loader2 } from 'lucide-react';
import axios from 'axios';

const uploadSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
});

type UploadValues = z.infer<typeof uploadSchema>;

export default function UploadForm() {
  const [file, setFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<UploadValues>({
    resolver: zodResolver(uploadSchema),
  });

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (!selectedFile.type.startsWith('image/') && !selectedFile.type.startsWith('video/')) {
        toast.error('Only images and videos are allowed');
        return;
      }
      setFile(selectedFile);
      // Auto-populate title from filename (strip extension)
      const baseName = selectedFile.name.replace(/\.[^/.]+$/, "");
      setValue('title', baseName);
    }
  };

  const onSubmit = async (data: UploadValues) => {
    if (!file) {
      toast.error('Please select a file');
      return;
    }

    setIsUploading(true);
    setUploadProgress(25);

    try {
      // Create FormData with file + title
      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', data.title);

      console.log('[UPLOAD_FORM] Starting upload:', {
        filename: file.name,
        fileSize: (file.size / (1024 * 1024)).toFixed(2) + ' MB',
        title: data.title,
      });

      setUploadProgress(50);

      // Upload via unified SDK endpoint using Fetch API
      // Note: Don't manually set Content-Type; browser handles it with boundary
      const fetchRes = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
        // Let browser automatically set Content-Type: multipart/form-data with boundary
      });

      if (!fetchRes.ok) {
        const errorData = await fetchRes.json().catch(() => ({}));
        const errorMsg = errorData.error || `HTTP ${fetchRes.status}`;
        throw new Error(errorMsg);
      }

      const json = await fetchRes.json();

      if (!json?.data) {
        throw new Error(json?.error || 'No response data from server');
      }

      setUploadProgress(100);
      console.log('[UPLOAD_FORM] Upload successful:', {
        assetId: json.data.id,
        title: json.data.title,
      });

      toast.success('Media uploaded successfully!');
      router.push('/admin');
      router.refresh();
    } catch (error: any) {
      console.error('[UPLOAD_FORM] Error:', {
        message: error.message,
        stack: error.stack,
      });

      const errorMessage = error.message || 'Failed to upload media';
      toast.error(typeof errorMessage === 'string' ? errorMessage : 'An unexpected error occurred');
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 bg-white p-8 rounded-xl border border-brand-border shadow-sm">
        {/* File Dropzone */}
        <div 
          onClick={() => !isUploading && fileInputRef.current?.click()}
          className={`
            border-2 border-dashed rounded-xl p-10 flex flex-col items-center justify-center transition-all cursor-pointer
            ${file ? 'border-brand-success bg-brand-success/5' : 'border-brand-border hover:border-brand-primary bg-brand-bg/50'}
            ${isUploading ? 'pointer-events-none opacity-60' : ''}
          `}
        >
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={onFileChange} 
            className="hidden" 
            accept="image/*,video/*"
          />
          
          {file ? (
            <div className="flex flex-col items-center text-center">
              <div className="p-3 bg-brand-success/20 rounded-full mb-4">
                <CheckCircle className="h-10 w-10 text-brand-success" />
              </div>
              <p className="font-bold text-brand-primary truncate max-w-xs">{file.name}</p>
              <p className="text-xs text-brand-muted mt-1">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
              {!isUploading && (
                <button 
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setFile(null); }}
                  className="mt-4 text-xs font-bold text-brand-danger hover:underline flex items-center gap-1"
                >
                  <X size={12} /> Remove
                </button>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center text-center">
              <div className="p-3 bg-brand-primary/10 rounded-full mb-4">
                <Upload className="h-10 w-10 text-brand-primary" />
              </div>
              <p className="font-bold text-brand-primary">Click to select a file</p>
              <p className="text-xs text-brand-muted mt-1">Images or Videos (max 500MB)</p>
            </div>
          )}
        </div>

        {/* Form Fields */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-brand-primary mb-2">
              Display Title
            </label>
            <input 
              {...register('title')}
              className="w-full px-4 py-3 border border-brand-border rounded-lg focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none transition-all"
              placeholder="Give this asset a clear name"
              disabled={isUploading}
            />
            {errors.title && <p className="mt-1 text-xs text-brand-danger">{errors.title.message}</p>}
          </div>
        </div>

        {/* Progress Bar */}
        {isUploading && (
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-bold text-brand-primary">
              <span>Uploading to Media Server...</span>
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

        <button
          type="submit"
          disabled={!file || isUploading}
          className="w-full py-4 bg-brand-primary text-white font-bold rounded-lg shadow-lg shadow-brand-primary/20 hover:bg-opacity-90 disabled:opacity-50 disabled:shadow-none transition-all flex items-center justify-center gap-2"
        >
          {isUploading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Upload className="h-5 w-5" />
              Start Upload
            </>
          )}
        </button>
      </form>
    </div>
  );
}
