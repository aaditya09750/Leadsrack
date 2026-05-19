import type { LeadStatus } from '../../types/api';

export const LEAD_STATUS_STYLES: Record<LeadStatus, string> = {
  New: 'bg-accent-sky/20 text-accent-sky',
  Contacted: 'bg-accent-purple/20 text-accent-purple',
  Qualified: 'bg-accent-green/20 text-accent-green',
  Lost: 'bg-primary/10 text-secondary',
};
