import { z } from 'zod';
import { TASK_PRIORITIES, TASK_STATUSES } from '../models/constants';

const dueDate = z
  .string()
  .refine((s) => !Number.isNaN(Date.parse(s)), 'Invalid date')
  .transform((s) => new Date(s))
  .nullable();

export const createTaskSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(120),
  description: z.string().trim().max(2000).optional(),
  status: z.enum(TASK_STATUSES).optional(),
  priority: z.enum(TASK_PRIORITIES).optional(),
  dueDate: dueDate.optional(),
});

export const updateTaskSchema = createTaskSchema
  .partial()
  .refine((v) => Object.keys(v).length > 0, 'Provide at least one field to update');

export const taskIdParamSchema = z.object({
  id: z.string().regex(/^[a-f\d]{24}$/i, 'Invalid task id'),
});

export const listTasksQuerySchema = z.object({
  status: z.enum(TASK_STATUSES).optional(),
  priority: z.enum(TASK_PRIORITIES).optional(),
  q: z.string().trim().max(100).optional(),
  sort: z.enum(['createdAt', '-createdAt', 'dueDate', '-dueDate']).default('-createdAt'),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type ListTasksQuery = z.infer<typeof listTasksQuerySchema>;
