import { Pencil, X } from 'lucide-react';
import { cn } from '../../lib/utils';
import { LEAD_STATUS_STYLES } from './leadStatusStyles';
import type { Lead } from '../../types/api';

interface LeadDetailProps {
  lead: Lead;
  onClose: () => void;
  onEdit: (lead: Lead) => void;
}

function formatDateTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

interface RowProps {
  label: string;
  children: React.ReactNode;
}

const Row = ({ label, children }: RowProps) => (
  <div className="flex items-start justify-between gap-4 py-2 border-b border-border last:border-b-0">
    <dt className="text-secondary text-xs uppercase tracking-wider min-w-[88px]">{label}</dt>
    <dd className="text-primary text-sm text-right break-words min-w-0 flex-1">{children}</dd>
  </div>
);

export const LeadDetail = ({ lead, onClose, onEdit }: LeadDetailProps) => (
  <div
    role="dialog"
    aria-modal="true"
    aria-labelledby="lead-detail-title"
    className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-6"
  >
    <div className="w-full max-w-md bg-background border border-border rounded-xl">
      <div className="flex items-center justify-between px-5 py-4 border-b border-border">
        <h2 id="lead-detail-title" className="font-display text-primary text-base font-semibold">
          Lead details
        </h2>
        <button
          type="button"
          onClick={onClose}
          className="p-1.5 rounded-lg text-secondary hover:bg-primary/5 hover:text-primary transition-colors"
          aria-label="Close"
        >
          <X size={16} />
        </button>
      </div>

      <dl className="px-5 py-3">
        <Row label="Name">{lead.name}</Row>
        <Row label="Email">
          <a
            href={`mailto:${lead.email}`}
            className="hover:underline text-accent-brand break-all"
          >
            {lead.email}
          </a>
        </Row>
        <Row label="Status">
          <span
            className={cn(
              'inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium',
              LEAD_STATUS_STYLES[lead.status],
            )}
          >
            {lead.status}
          </span>
        </Row>
        <Row label="Source">{lead.source}</Row>
        <Row label="Created">{formatDateTime(lead.createdAt)}</Row>
        <Row label="Updated">{formatDateTime(lead.updatedAt)}</Row>
      </dl>

      <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-border">
        <button
          type="button"
          onClick={onClose}
          className="px-3 py-1.5 rounded-lg text-secondary text-xs hover:bg-primary/5 hover:text-primary transition-colors"
        >
          Close
        </button>
        <button
          type="button"
          onClick={() => onEdit(lead)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent-brand text-white text-xs font-medium hover:opacity-90 transition-opacity"
        >
          <Pencil size={14} />
          Edit
        </button>
      </div>
    </div>
  </div>
);
