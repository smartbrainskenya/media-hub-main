import { z } from 'zod';

export const CreateMediaSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  type: z.enum(['image', 'video']),
  branded_url: z.string().url('Invalid branded URL'),
  publitio_id: z.string().min(1, 'Publitio ID is required'),
});

export const UpdateMediaSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200).optional(),
});

export const ImportMediaSchema = z.object({
  url: z.string().url('Invalid URL'),
  title: z.string().min(1, 'Title is required').max(200),
});
