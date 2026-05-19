import { Pencil, Trash2 } from 'lucide-react';
import { cn } from '../../lib/utils';
import type { Lead, LeadStatus } from '../../types/api';

interface LeadTableProps {
  leads: Lead[];
  onEdit: (lead: Lead) => void;
  onDelete: (lead: Lead) => void;
}

const STATUS_STYLES: Record<LeadStatus, string> = {
  New: 'bg-accent-sky/20 text-accent-sky',
  Contacted: 'bg-accent-purple/20 text-accent-purple',
  Qualified: 'bg-accent-green/20 text-accent-green',
  Lost: 'bg-white/10 text-secondary',
};

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: '2-digit' });
}

export const LeadTable = ({ leads, onEdit, onDelete }: LeadTableProps) => (
  <div className="mx-7 rounded-xl border border-border bg-white/5 overflow-hidden">
    <table className="w-full text-left text-xs">
      <thead className="bg-white/[0.03]">
        <tr className="text-secondary uppercase tracking-wider">
          <th className="px-4 py-3 font-medium">Name</th>
          <th className="px-4 py-3 font-medium">Email</th>
          <th className="px-4 py-3 font-medium">Status</th>
          <th className="px-4 py-3 font-medium">Source</th>
          <th className="px-4 py-3 font-medium">Created</th>
          <th className="px-4 py-3 font-medium text-right">Actions</th>
        </tr>
      </thead>
      <tbody>
        {leads.map((lead) => (
          <tr key={lead.id} className="border-t border-border hover:bg-white/[0.02] transition-colors">
            <td className="px-4 py-3 text-primary font-medium">{lead.name}</td>
            <td className="px-4 py-3 text-secondary">{lead.email}</td>
            <td className="px-4 py-3">
              <span
                className={cn(
                  'inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium',
                  STATUS_STYLES[lead.status],
                )}
              >
                {lead.status}
              </span>
            </td>
            <td className="px-4 py-3 text-secondary">{lead.source}</td>
            <td className="px-4 py-3 text-secondary">{formatDate(lead.createdAt)}</td>
            <td className="px-4 py-3 text-right">
              <div className="inline-flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => onEdit(lead)}
                  className="p-1.5 rounded-lg text-secondary hover:bg-white/5 hover:text-primary transition-colors"
                  aria-label={`Edit ${lead.name}`}
                >
                  <Pencil size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(lead)}
                  className="p-1.5 rounded-lg text-secondary hover:bg-red-500/10 hover:text-red-400 transition-colors"
                  aria-label={`Delete ${lead.name}`}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);
