'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'react-hot-toast';
import { Link as LinkIcon, Loader2 } from 'lucide-react';
import axios from 'axios';
import { ImportMediaSchema } from '@/lib/validations';
import { z } from 'zod';

type ImportValues = z.infer<typeof ImportMediaSchema>;

export default function ImportForm() {
  const [isImporting, setIsImporting] = useState(false);
  const router = useRouter();

  const { register, handleSubmit, formState: { errors } } = useForm<ImportValues>({
    resolver: zodResolver(ImportMediaSchema),
  });

  const onSubmit = async (data: ImportValues) => {
    setIsImporting(true);
    try {
      console.log('[IMPORT_FORM] Starting import from URL:', data.url);
      
      const res = await axios.post('/api/import', data);
      
      if (!res.data?.data) {
        throw new Error(res.data?.error || 'No response data from server');
      }

      console.log('[IMPORT_FORM] Import successful:', {
        assetId: res.data.data.id,
        title: res.data.data.title,
      });

      toast.success('Media imported successfully!');
      router.push('/admin');
      router.refresh();
    } catch (error) {
      let errorMessage = 'Failed to import media';

      if (axios.isAxiosError(error)) {
        console.error('[IMPORT_FORM] Error:', {
          message: error.message,
          status: error.response?.status,
          errorData: error.response?.data,
        });
        errorMessage = error.response?.data?.error || error.message;
      } else if (error instanceof Error) {
        console.error('[IMPORT_FORM] Non-Axios Error:', error.message);
        errorMessage = error.message;
      }

      toast.error(typeof errorMessage === 'string' ? errorMessage : 'An unexpected error occurred');
      setIsImporting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 bg-white p-8 rounded-xl border border-brand-border shadow-sm">
        <div className="p-4 bg-brand-secondary/10 rounded-lg flex items-start gap-4 mb-6">
          <LinkIcon className="h-6 w-6 text-brand-secondary shrink-0 mt-1" />
          <div className="text-sm">
            <p className="font-bold text-brand-primary">Import from URL</p>
            <p className="text-brand-muted">Paste a direct link to an image or video. This is reliable for files under 100MB.</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-brand-primary mb-2">
              Media URL
            </label>
            <input 
              {...register('url')}
              className="w-full px-4 py-3 border border-brand-border rounded-lg focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none transition-all"
              placeholder="https://example.com/image.jpg"
              disabled={isImporting}
            />
            {errors.url && <p className="mt-1 text-xs text-brand-danger">{errors.url.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-bold text-brand-primary mb-2">
              Display Title
            </label>
            <input 
              {...register('title')}
              className="w-full px-4 py-3 border border-brand-border rounded-lg focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none transition-all"
              placeholder="Enter a descriptive title"
              disabled={isImporting}
            />
            {errors.title && <p className="mt-1 text-xs text-brand-danger">{errors.title.message}</p>}
          </div>
        </div>

        <button
          type="submit"
          disabled={isImporting}
          className="w-full py-4 bg-brand-primary text-white font-bold rounded-lg shadow-lg shadow-brand-primary/20 hover:bg-opacity-90 disabled:opacity-50 disabled:shadow-none transition-all flex items-center justify-center gap-2"
        >
          {isImporting ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Importing Media...
            </>
          ) : (
            <>
              <LinkIcon className="h-5 w-5" />
              Start Import
            </>
          )}
        </button>
      </form>
    </div>
  );
}
