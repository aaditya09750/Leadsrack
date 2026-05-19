import { AsyncParser } from '@json2csv/node';
import type { Response } from 'express';
import { listAllFilteredLeads, type Viewer } from './leads.js';
import type { ListLeadsQuery } from '../schemas/lead.js';

const CSV_FIELDS = ['name', 'email', 'status', 'source', 'createdAt', 'updatedAt'];

export async function streamLeadsCsv(
  res: Response,
  query: ListLeadsQuery,
  viewer: Viewer,
): Promise<void> {
  const leads = await listAllFilteredLeads(query, viewer);

  // AsyncParser collects the full array → CSV string. For our pagination-capped
  // scale (a few thousand rows max in practice), in-memory serialization is
  // far simpler and more reliable than a Mongoose-cursor → Transform pipeline.
  const parser = new AsyncParser({ fields: CSV_FIELDS });
  const csv = await parser.parse(leads).promise();

  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="leads-${Date.now()}.csv"`);
  res.send(csv);
}
