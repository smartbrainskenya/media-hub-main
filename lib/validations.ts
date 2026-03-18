import { z } from 'zod';

const categorySchema = z
  .string()
  .trim()
  .min(1, 'Category is required')
  .max(50, 'Category is too long')
  .regex(/^[a-zA-Z0-9\s-]+$/, 'Category can only contain letters, numbers, spaces, and hyphens');

export const CreateMediaSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  type: z.enum(['image', 'video']),
  category_slug: categorySchema.optional(),
  branded_url: z.string().url('Invalid branded URL'),
  publitio_id: z.string().min(1, 'Publitio ID is required'),
});

export const UpdateMediaSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200).optional(),
  category_slug: categorySchema.optional(),
});

export const ImportMediaSchema = z.object({
  url: z.string().url('Invalid URL'),
  title: z.string().min(1, 'Title is required').max(200),
});
