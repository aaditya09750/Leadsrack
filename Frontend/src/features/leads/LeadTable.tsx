import { Eye, Pencil, Trash2 } from 'lucide-react';
import { cn } from '../../lib/utils';
import { LEAD_STATUS_STYLES } from './leadStatusStyles';
import type { Lead } from '../../types/api';

interface LeadTableProps {
  leads: Lead[];
  onView: (lead: Lead) => void;
  onEdit: (lead: Lead) => void;
  onDelete: (lead: Lead) => void;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: '2-digit' });
}

interface RowActionsProps {
  lead: Lead;
  onView: (lead: Lead) => void;
  onEdit: (lead: Lead) => void;
  onDelete: (lead: Lead) => void;
}

const RowActions = ({ lead, onView, onEdit, onDelete }: RowActionsProps) => (
  <div className="inline-flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
    <button
      type="button"
      onClick={() => onView(lead)}
      className="p-1.5 rounded-lg text-secondary hover:bg-primary/5 hover:text-primary transition-colors"
      aria-label={`View ${lead.name}`}
    >
      <Eye size={14} />
    </button>
    <button
      type="button"
      onClick={() => onEdit(lead)}
      className="p-1.5 rounded-lg text-secondary hover:bg-primary/5 hover:text-primary transition-colors"
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
);

export const LeadTable = ({ leads, onView, onEdit, onDelete }: LeadTableProps) => (
  <>
    {/* Desktop / tablet: classic table */}
    <div className="mx-4 md:mx-7 hidden md:block rounded-xl border border-border bg-surface overflow-hidden">
      <table className="w-full text-left text-xs">
        <thead className="bg-primary/[0.03]">
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
            <tr
              key={lead.id}
              onClick={() => onView(lead)}
              className="border-t border-border hover:bg-primary/[0.02] transition-colors cursor-pointer"
            >
              <td className="px-4 py-3 text-primary font-medium">{lead.name}</td>
              <td className="px-4 py-3 text-secondary">{lead.email}</td>
              <td className="px-4 py-3">
                <span
                  className={cn(
                    'inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium',
                    LEAD_STATUS_STYLES[lead.status],
                  )}
                >
                  {lead.status}
                </span>
              </td>
              <td className="px-4 py-3 text-secondary">{lead.source}</td>
              <td className="px-4 py-3 text-secondary">{formatDate(lead.createdAt)}</td>
              <td className="px-4 py-3 text-right">
                <RowActions lead={lead} onView={onView} onEdit={onEdit} onDelete={onDelete} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>

    {/* Mobile: cards. Each card is tappable to open detail; action buttons stop propagation. */}
    <div className="mx-4 md:hidden space-y-3">
      {leads.map((lead) => (
        <div
          key={lead.id}
          role="button"
          tabIndex={0}
          onClick={() => onView(lead)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onView(lead);
            }
          }}
          className="rounded-xl border border-border bg-surface p-4 hover:bg-primary/[0.02] transition-colors cursor-pointer"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-primary text-sm font-medium truncate">{lead.name}</p>
              <p className="text-secondary text-xs truncate mt-0.5">{lead.email}</p>
            </div>
            <span
              className={cn(
                'inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium shrink-0',
                LEAD_STATUS_STYLES[lead.status],
              )}
            >
              {lead.status}
            </span>
          </div>

          <div className="flex items-center justify-between gap-3 mt-3">
            <p className="text-secondary text-[11px]">
              <span className="text-primary/80">{lead.source}</span>
              <span className="mx-1.5 text-muted">·</span>
              {formatDate(lead.createdAt)}
            </p>
            <RowActions lead={lead} onView={onView} onEdit={onEdit} onDelete={onDelete} />
          </div>
        </div>
      ))}
    </div>
  </>
);
