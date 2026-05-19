import { api } from '../lib/api';
import { env } from '../lib/env';
import { getStoredToken } from '../store/authStore';
import type { Lead, LeadsQuery, Paginated, LeadStatus, LeadSource } from '../types/api';

interface ApiEnvelope<T> {
  data: T;
}

function toParams(query: LeadsQuery): Record<string, string | number> {
  const params: Record<string, string | number> = {};
  if (query.status) params.status = query.status;
  if (query.source) params.source = query.source;
  if (query.search) params.search = query.search;
  if (query.sort) params.sort = query.sort;
  if (query.page) params.page = query.page;
  if (query.owner) params.owner = query.owner;
  return params;
}

export async function listLeads(query: LeadsQuery): Promise<Paginated<Lead>> {
  const res = await api.get<Paginated<Lead>>('/leads', { params: toParams(query) });
  return res.data;
}

export async function getLead(id: string): Promise<Lead> {
  const res = await api.get<ApiEnvelope<Lead>>(`/leads/${id}`);
  return res.data.data;
}

export async function createLead(input: {
  name: string;
  email: string;
  status?: LeadStatus;
  source: LeadSource;
}): Promise<Lead> {
  const res = await api.post<ApiEnvelope<Lead>>('/leads', input);
  return res.data.data;
}

export async function updateLead(
  id: string,
  input: Partial<{ name: string; email: string; status: LeadStatus; source: LeadSource }>,
): Promise<Lead> {
  const res = await api.patch<ApiEnvelope<Lead>>(`/leads/${id}`, input);
  return res.data.data;
}

export async function deleteLead(id: string): Promise<void> {
  await api.delete(`/leads/${id}`);
}

/**
 * Triggers the browser to download a CSV of the filtered leads.
 * Uses fetch+blob (not axios) so we control the filename and avoid axios's JSON parsing.
 */
export async function exportLeadsCsv(query: LeadsQuery): Promise<void> {
  const params = new URLSearchParams(toParams(query) as Record<string, string>);
  const url = `${env.apiUrl}/leads/export.csv?${params.toString()}`;
  const token = getStoredToken();
  const res = await fetch(url, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) throw new Error(`Export failed: ${res.status} ${res.statusText}`);
  const blob = await res.blob();
  const objectUrl = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = objectUrl;
  a.download = `leads-${Date.now()}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(objectUrl);
}
