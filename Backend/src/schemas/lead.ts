import { z } from 'zod';
import { LEAD_STATUSES, LEAD_SOURCES } from '../models/Lead.js';

export const createLeadSchema = z.object({
  name: z.string().trim().min(1).max(100),
  email: z.string().trim().toLowerCase().email().max(254),
  status: z.enum(LEAD_STATUSES).optional().default('New'),
  source: z.enum(LEAD_SOURCES),
});

export const updateLeadSchema = z
  .object({
    name: z.string().trim().min(1).max(100).optional(),
    email: z.string().trim().toLowerCase().email().max(254).optional(),
    status: z.enum(LEAD_STATUSES).optional(),
    source: z.enum(LEAD_SOURCES).optional(),
  })
  .refine((v) => Object.keys(v).length > 0, { message: 'No fields to update' });

export const listLeadsQuerySchema = z.object({
  status: z.enum(LEAD_STATUSES).optional(),
  source: z.enum(LEAD_SOURCES).optional(),
  search: z.string().trim().min(1).max(100).optional(),
  sort: z.enum(['latest', 'oldest']).optional().default('latest'),
  page: z.coerce.number().int().min(1).optional().default(1),
  owner: z.string().trim().toLowerCase().email().max(254).optional(),
});

export const leadIdParamsSchema = z.object({
  id: z.string().regex(/^[a-f0-9]{24}$/i, 'Invalid id'),
});

export type CreateLeadInput = z.infer<typeof createLeadSchema>;
export type UpdateLeadInput = z.infer<typeof updateLeadSchema>;
export type ListLeadsQuery = z.infer<typeof listLeadsQuerySchema>;
