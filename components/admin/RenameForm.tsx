'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'react-hot-toast';
import { Save, Loader2 } from 'lucide-react';
import axios from 'axios';
import { UpdateMediaSchema } from '@/lib/validations';
import { MediaAsset } from '@/types';
import { z } from 'zod';

type RenameValues = z.infer<typeof UpdateMediaSchema>;

interface RenameFormProps {
  asset: MediaAsset;
  onSuccess: (updatedAsset: MediaAsset) => void;
}

export default function RenameForm({ asset, onSuccess }: RenameFormProps) {
  const [isSaving, setIsSaving] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<RenameValues>({
    resolver: zodResolver(UpdateMediaSchema),
    defaultValues: {
      title: asset.title
    }
  });

  const onSubmit = async (data: RenameValues) => {
    setIsSaving(true);
    try {
      const response = await axios.patch(`/api/media/${asset.id}`, data);
      toast.success('Asset renamed successfully!');
      onSuccess(response.data.data);
    } catch (error: any) {
      console.error('Rename error:', error);
      toast.error(error.response?.data?.error || 'Failed to rename asset');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-sm font-bold text-brand-primary mb-2 uppercase tracking-wide">
          Asset Title
        </label>
        <div className="flex gap-2">
          <input 
            {...register('title')}
            className="flex-grow px-4 py-3 border border-brand-border rounded-lg focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none transition-all"
            placeholder="New title"
            disabled={isSaving}
          />
          <button
            type="submit"
            disabled={isSaving}
            className="px-6 bg-brand-primary text-white font-bold rounded-lg hover:bg-opacity-90 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
          >
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save size={18} />}
            Save
          </button>
        </div>
        {errors.title && <p className="mt-1 text-xs text-brand-danger">{errors.title.message}</p>}
      </div>
    </form>
  );
}
