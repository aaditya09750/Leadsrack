import type { Request, Response } from 'express';
import { asyncHandler } from '../lib/asyncHandler.js';
import { unauthorized } from '../lib/errors.js';
import * as leadsService from '../services/leads.js';
import { streamLeadsCsv } from '../services/csv.js';
import type { CreateLeadInput, UpdateLeadInput, ListLeadsQuery } from '../schemas/lead.js';

export const list = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw unauthorized();
  const query = req.query as unknown as ListLeadsQuery;
  const result = await leadsService.listLeads(query, req.user);
  res.json({
    data: result.data.map((lead) => lead.toJSON()),
    meta: result.meta,
  });
});

export const create = asyncHandler(
  async (req: Request<unknown, unknown, CreateLeadInput>, res: Response) => {
    if (!req.user) throw unauthorized();
    const lead = await leadsService.createLead(req.body, req.user);
    res.status(201).json({ data: lead.toJSON() });
  },
);

export const getOne = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw unauthorized();
  const lead = await leadsService.getLead(req.params.id as string, req.user);
  res.json({ data: lead.toJSON() });
});

export const update = asyncHandler(
  async (req: Request<{ id: string }, unknown, UpdateLeadInput>, res: Response) => {
    if (!req.user) throw unauthorized();
    const lead = await leadsService.updateLead(req.params.id, req.body, req.user);
    res.json({ data: lead.toJSON() });
  },
);

export const remove = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw unauthorized();
  await leadsService.deleteLead(req.params.id as string, req.user);
  res.status(204).end();
});

export const exportCsv = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw unauthorized();
  const query = req.query as unknown as ListLeadsQuery;
  await streamLeadsCsv(res, query, req.user);
});
