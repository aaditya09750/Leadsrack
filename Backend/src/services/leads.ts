import { Lead, type LeadDoc } from '../models/Lead.js';
import { User } from '../models/User.js';
import { forbidden, notFound } from '../lib/errors.js';
import type { Role } from '../models/User.js';
import type { CreateLeadInput, UpdateLeadInput, ListLeadsQuery } from '../schemas/lead.js';

export const PAGE_LIMIT = 10;

export interface Viewer {
  id: string;
  role: Role;
}

function escapeRegex(input: string): string {
  return input.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

async function buildFilter(
  query: ListLeadsQuery,
  viewer: Viewer,
): Promise<Record<string, unknown>> {
  const filter: Record<string, unknown> = {};

  if (viewer.role !== 'admin') {
    // Sales user — always restricted to their own leads. owner param is ignored.
    filter.createdBy = viewer.id;
  } else if (query.owner) {
    // Admin filtering by owner email. Unknown email → force empty result.
    const target = await User.findOne({ email: query.owner }, { _id: 1 }).lean();
    filter.createdBy = target ? target._id : null;
  }

  if (query.status) filter.status = query.status;
  if (query.source) filter.source = query.source;
  if (query.search) {
    const re = new RegExp(escapeRegex(query.search), 'i');
    filter.$or = [{ name: re }, { email: re }];
  }
  return filter;
}

interface ListResult {
  data: LeadDoc[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}

export async function listLeads(query: ListLeadsQuery, viewer: Viewer): Promise<ListResult> {
  const filter = await buildFilter(query, viewer);
  const sortDir: 1 | -1 = query.sort === 'oldest' ? 1 : -1;
  const total = await Lead.countDocuments(filter);
  const items = await Lead.find(filter)
    .sort({ createdAt: sortDir })
    .skip((query.page - 1) * PAGE_LIMIT)
    .limit(PAGE_LIMIT);
  return {
    data: items,
    meta: {
      total,
      page: query.page,
      limit: PAGE_LIMIT,
      totalPages: Math.max(1, Math.ceil(total / PAGE_LIMIT)),
    },
  };
}

export interface LeadCsvRow {
  name: string;
  email: string;
  status: string;
  source: string;
  createdAt: Date;
  updatedAt: Date;
}

export async function listAllFilteredLeads(
  query: ListLeadsQuery,
  viewer: Viewer,
): Promise<LeadCsvRow[]> {
  const filter = await buildFilter(query, viewer);
  const sortDir: 1 | -1 = query.sort === 'oldest' ? 1 : -1;
  const rows = await Lead.find(filter, {
    name: 1,
    email: 1,
    status: 1,
    source: 1,
    createdAt: 1,
    updatedAt: 1,
    _id: 0,
  })
    .sort({ createdAt: sortDir })
    .lean();
  return rows as unknown as LeadCsvRow[];
}

export async function getLead(id: string, viewer: Viewer): Promise<LeadDoc> {
  const lead = await Lead.findById(id);
  if (!lead) throw notFound('Lead not found');
  if (viewer.role !== 'admin' && String(lead.createdBy) !== viewer.id) throw forbidden();
  return lead;
}

export async function createLead(input: CreateLeadInput, viewer: Viewer): Promise<LeadDoc> {
  return Lead.create({ ...input, createdBy: viewer.id });
}

export async function updateLead(
  id: string,
  input: UpdateLeadInput,
  viewer: Viewer,
): Promise<LeadDoc> {
  const lead = await getLead(id, viewer);
  Object.assign(lead, input);
  await lead.save();
  return lead;
}

export async function deleteLead(id: string, viewer: Viewer): Promise<void> {
  const lead = await getLead(id, viewer);
  await lead.deleteOne();
}
