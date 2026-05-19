export type Role = 'admin' | 'sales';

export type LeadStatus = 'New' | 'Contacted' | 'Qualified' | 'Lost';
export const LEAD_STATUSES: LeadStatus[] = ['New', 'Contacted', 'Qualified', 'Lost'];

export type LeadSource = 'Website' | 'Instagram' | 'Referral';
export const LEAD_SOURCES: LeadSource[] = ['Website', 'Instagram', 'Referral'];

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  createdAt: string;
  updatedAt: string;
}

export interface Lead {
  id: string;
  name: string;
  email: string;
  status: LeadStatus;
  source: LeadSource;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface PageMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface Paginated<T> {
  data: T[];
  meta: PageMeta;
}

export interface ApiError {
  code: string;
  message: string;
  details?: unknown;
}

export interface ApiErrorResponse {
  error: ApiError;
}

export type SortOrder = 'latest' | 'oldest';

export interface LeadsQuery {
  status?: LeadStatus;
  source?: LeadSource;
  search?: string;
  sort?: SortOrder;
  page?: number;
}

export interface AuthResponse {
  user: User;
  token: string;
}
