import { Search, Download, Plus } from 'lucide-react';
import { Select, type SelectOption } from '../../components/ui/Select';
import {
  LEAD_STATUSES,
  LEAD_SOURCES,
  type LeadStatus,
  type LeadSource,
  type SortOrder,
} from '../../types/api';

export interface MemberOption {
  email: string;
  name: string;
}

interface LeadFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  status: LeadStatus | '';
  onStatusChange: (value: LeadStatus | '') => void;
  source: LeadSource | '';
  onSourceChange: (value: LeadSource | '') => void;
  sort: SortOrder;
  onSortChange: (value: SortOrder) => void;
  owner: string;
  onOwnerChange: (email: string) => void;
  members?: MemberOption[];
  onNewLead: () => void;
  onExport: () => void;
  exporting: boolean;
}

const STATUS_OPTIONS: SelectOption[] = [
  { value: '', label: 'All statuses' },
  ...LEAD_STATUSES.map((s) => ({ value: s, label: s })),
];

const SOURCE_OPTIONS: SelectOption[] = [
  { value: '', label: 'All sources' },
  ...LEAD_SOURCES.map((s) => ({ value: s, label: s })),
];

const SORT_OPTIONS: SelectOption[] = [
  { value: 'latest', label: 'Latest first' },
  { value: 'oldest', label: 'Oldest first' },
];

// Mobile pattern: search row, then 2-col grid of selects, then full-width button row.
// `w-[calc(50%-0.375rem)]` = half-width minus half of `gap-3` (12px / 2 = 6px = 0.375rem).
const halfOnMobile = 'w-[calc(50%-0.375rem)]';

export const LeadFilters = ({
  search,
  onSearchChange,
  status,
  onStatusChange,
  source,
  onSourceChange,
  sort,
  onSortChange,
  owner,
  onOwnerChange,
  members,
  onNewLead,
  onExport,
  exporting,
}: LeadFiltersProps) => {
  const memberOptions: SelectOption[] | null = members
    ? [
        { value: '', label: 'All members' },
        ...members.map((m) => ({ value: m.email, label: m.name })),
      ]
    : null;

  return (
    <div className="flex flex-wrap items-center gap-3 px-4 md:px-7 mb-5">
      <div className="relative w-full md:flex-1 md:min-w-[240px]">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary pointer-events-none"
        />
        <input
          type="search"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search name or email"
          className="w-full pl-10 pr-3 py-2 rounded-lg bg-primary/5 border border-border text-primary text-sm placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-accent-brand"
        />
      </div>

      <Select
        value={status}
        onChange={(v) => onStatusChange(v as LeadStatus | '')}
        options={STATUS_OPTIONS}
        size="md"
        aria-label="Filter by status"
        className={`${halfOnMobile} md:w-[160px]`}
      />

      <Select
        value={source}
        onChange={(v) => onSourceChange(v as LeadSource | '')}
        options={SOURCE_OPTIONS}
        size="md"
        aria-label="Filter by source"
        className={`${halfOnMobile} md:w-[160px]`}
      />

      {memberOptions ? (
        <Select
          value={owner}
          onChange={onOwnerChange}
          options={memberOptions}
          size="md"
          aria-label="Filter by team member"
          className={`${halfOnMobile} md:w-[180px]`}
        />
      ) : null}

      <Select
        value={sort}
        onChange={(v) => onSortChange(v as SortOrder)}
        options={SORT_OPTIONS}
        size="md"
        aria-label="Sort order"
        className={`${halfOnMobile} md:w-[160px]`}
      />

      <div className="flex items-center gap-2 w-full md:w-auto md:ml-auto">
        <button
          type="button"
          onClick={onExport}
          disabled={exporting}
          className="flex-1 md:flex-none inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-border text-primary text-sm hover:bg-primary/5 transition-colors disabled:opacity-50"
        >
          <Download size={16} />
          {exporting ? 'Exporting…' : 'Export CSV'}
        </button>
        <button
          type="button"
          onClick={onNewLead}
          className="flex-1 md:flex-none inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-accent-brand text-white text-sm font-medium hover:opacity-90 transition-opacity"
        >
          <Plus size={16} />
          New lead
        </button>
      </div>
    </div>
  );
};
