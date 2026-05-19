import { Transform } from '@json2csv/node';
import { pipeline } from 'node:stream/promises';
import type { Response } from 'express';
import { streamFilteredLeads, type Viewer } from './leads.js';
import type { ListLeadsQuery } from '../schemas/lead.js';

const CSV_FIELDS = ['name', 'email', 'status', 'source', 'createdAt', 'updatedAt'];

export async function streamLeadsCsv(
  res: Response,
  query: ListLeadsQuery,
  viewer: Viewer,
): Promise<void> {
  const cursor = streamFilteredLeads(query, viewer);
  const csv = new Transform({ fields: CSV_FIELDS }, { objectMode: true });

  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="leads-${Date.now()}.csv"`);

  await pipeline(cursor, csv, res);
}
