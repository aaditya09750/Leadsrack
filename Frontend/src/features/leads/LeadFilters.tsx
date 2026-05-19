import { Search, Download, Plus } from 'lucide-react';
import {
  LEAD_STATUSES,
  LEAD_SOURCES,
  type LeadStatus,
  type LeadSource,
  type SortOrder,
} from '../../types/api';

interface LeadFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  status: LeadStatus | '';
  onStatusChange: (value: LeadStatus | '') => void;
  source: LeadSource | '';
  onSourceChange: (value: LeadSource | '') => void;
  sort: SortOrder;
  onSortChange: (value: SortOrder) => void;
  onNewLead: () => void;
  onExport: () => void;
  exporting: boolean;
}

const selectClass =
  'px-3 py-1.5 rounded-lg bg-white/5 border border-border text-primary text-xs focus:outline-none focus:ring-1 focus:ring-accent-brand';

export const LeadFilters = ({
  search,
  onSearchChange,
  status,
  onStatusChange,
  source,
  onSourceChange,
  sort,
  onSortChange,
  onNewLead,
  onExport,
  exporting,
}: LeadFiltersProps) => (
  <div className="flex flex-wrap items-center gap-3 px-7 mb-5">
    <div className="relative flex-1 min-w-[220px]">
      <Search
        size={14}
        className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary pointer-events-none"
      />
      <input
        type="search"
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder="Search name or email"
        className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-white/5 border border-border text-primary text-xs placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-accent-brand"
      />
    </div>

    <select
      value={status}
      onChange={(e) => onStatusChange(e.target.value as LeadStatus | '')}
      className={selectClass}
      aria-label="Filter by status"
    >
      <option value="">All statuses</option>
      {LEAD_STATUSES.map((s) => (
        <option key={s} value={s}>
          {s}
        </option>
      ))}
    </select>

    <select
      value={source}
      onChange={(e) => onSourceChange(e.target.value as LeadSource | '')}
      className={selectClass}
      aria-label="Filter by source"
    >
      <option value="">All sources</option>
      {LEAD_SOURCES.map((s) => (
        <option key={s} value={s}>
          {s}
        </option>
      ))}
    </select>

    <select
      value={sort}
      onChange={(e) => onSortChange(e.target.value as SortOrder)}
      className={selectClass}
      aria-label="Sort order"
    >
      <option value="latest">Latest first</option>
      <option value="oldest">Oldest first</option>
    </select>

    <div className="flex items-center gap-2 ml-auto">
      <button
        type="button"
        onClick={onExport}
        disabled={exporting}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-primary text-xs hover:bg-white/5 transition-colors disabled:opacity-50"
      >
        <Download size={14} />
        {exporting ? 'Exporting…' : 'Export CSV'}
      </button>
      <button
        type="button"
        onClick={onNewLead}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent-brand text-white text-xs font-medium hover:opacity-90 transition-opacity"
      >
        <Plus size={14} />
        New lead
      </button>
    </div>
  </div>
);
