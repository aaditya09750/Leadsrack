import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useDebounce } from '../../hooks/useDebounce';
import { LoadingSpinner } from '../../components/feedback/LoadingSpinner';
import { EmptyState } from '../../components/feedback/EmptyState';
import { ErrorState } from '../../components/feedback/ErrorState';
import { extractErrorMessage } from '../../lib/api';
import { exportLeadsCsv } from '../../api/leads';
import { useAuthStore } from '../../store/authStore';
import { useTeam } from '../team/useTeam';
import { LeadFilters, type MemberOption } from './LeadFilters';
import { LeadTable } from './LeadTable';
import { LeadForm, type LeadFormValues } from './LeadForm';
import { LeadDetail } from './LeadDetail';
import {
  useLeadsQuery,
  useCreateLead,
  useUpdateLead,
  useDeleteLead,
} from './useLeads';
import type {
  Lead,
  LeadsQuery,
  LeadStatus,
  LeadSource,
  SortOrder,
} from '../../types/api';

export const LeadsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const ownerEmail = searchParams.get('owner') ?? '';

  const user = useAuthStore((s) => s.user);
  const isAdmin = user?.role === 'admin';
  const { data: teamData } = useTeam({ enabled: isAdmin });
  const members: MemberOption[] | undefined = isAdmin
    ? (teamData?.members.map((m) => ({ email: m.email, name: m.name })) ?? [])
    : undefined;

  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<LeadStatus | ''>('');
  const [source, setSource] = useState<LeadSource | ''>('');
  const [sort, setSort] = useState<SortOrder>('latest');
  const [page, setPage] = useState(1);
  const [viewing, setViewing] = useState<Lead | null>(null);
  const [editing, setEditing] = useState<Lead | null>(null);
  const [creating, setCreating] = useState(false);
  const [exporting, setExporting] = useState(false);

  const debouncedSearch = useDebounce(search, 400);

  // When the owner filter changes (e.g. coming from the Team page) reset page to 1.
  useEffect(() => {
    setPage(1);
  }, [ownerEmail]);

  const query: LeadsQuery = useMemo(() => {
    // Trim whitespace from the search before forming the query. A field with only
    // spaces does not change the query key — React Query treats it as identical to
    // the prior state and skips the network round-trip.
    const trimmedSearch = debouncedSearch.trim();
    return {
      ...(status ? { status } : {}),
      ...(source ? { source } : {}),
      ...(trimmedSearch ? { search: trimmedSearch } : {}),
      ...(ownerEmail ? { owner: ownerEmail } : {}),
      sort,
      page,
    };
  }, [status, source, debouncedSearch, sort, page, ownerEmail]);

  const { data, isLoading, isError, error, refetch, isFetching } = useLeadsQuery(query);

  const createMut = useCreateLead();
  const updateMut = useUpdateLead();
  const deleteMut = useDeleteLead();

  const resetToFirstPage = () => setPage(1);

  const setOwner = (email: string) => {
    const next = new URLSearchParams(searchParams);
    if (email) next.set('owner', email);
    else next.delete('owner');
    setSearchParams(next, { replace: true });
  };

  const handleCreate = async (values: LeadFormValues) => {
    try {
      await createMut.mutateAsync(values);
      toast.success('Lead created');
      setCreating(false);
    } catch (err) {
      toast.error(extractErrorMessage(err));
    }
  };

  const handleUpdate = async (values: LeadFormValues) => {
    if (!editing) return;
    try {
      await updateMut.mutateAsync({ id: editing.id, data: values });
      toast.success('Lead updated');
      setEditing(null);
    } catch (err) {
      toast.error(extractErrorMessage(err));
    }
  };

  const handleDelete = async (lead: Lead) => {
    if (!window.confirm(`Delete lead ${lead.name}?`)) return;
    try {
      await deleteMut.mutateAsync(lead.id);
      toast.success('Lead deleted');
    } catch (err) {
      toast.error(extractErrorMessage(err));
    }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      await exportLeadsCsv(query);
    } catch (err) {
      toast.error(extractErrorMessage(err));
    } finally {
      setExporting(false);
    }
  };

  const leads = data?.data ?? [];
  const meta = data?.meta;

  return (
    <>
      <div className="px-4 md:px-7 pt-5 md:pt-7 pb-4 flex items-center justify-between">
        <div>
          <h1 className="font-display text-primary text-xl font-semibold">Leads</h1>
          <p className="text-secondary text-xs mt-1">
            {meta ? `${meta.total} total` : '—'}
            {isFetching ? ' · refreshing…' : ''}
          </p>
        </div>
      </div>

      <LeadFilters
        search={search}
        onSearchChange={(v) => {
          setSearch(v);
          resetToFirstPage();
        }}
        status={status}
        onStatusChange={(v) => {
          setStatus(v);
          resetToFirstPage();
        }}
        source={source}
        onSourceChange={(v) => {
          setSource(v);
          resetToFirstPage();
        }}
        sort={sort}
        onSortChange={(v) => {
          setSort(v);
          resetToFirstPage();
        }}
        owner={ownerEmail}
        onOwnerChange={(email) => {
          setOwner(email);
          resetToFirstPage();
        }}
        members={members}
        onNewLead={() => setCreating(true)}
        onExport={() => void handleExport()}
        exporting={exporting}
      />

      {isLoading ? (
        <div className="px-4 md:px-7">
          <div className="rounded-xl border border-border bg-surface py-12 flex justify-center">
            <LoadingSpinner label="Loading leads" />
          </div>
        </div>
      ) : isError ? (
        <div className="px-4 md:px-7">
          <ErrorState message={extractErrorMessage(error)} onRetry={() => void refetch()} />
        </div>
      ) : leads.length === 0 ? (
        <div className="px-4 md:px-7">
          <EmptyState
            title="No leads yet"
            description={
              debouncedSearch.trim() || status || source || ownerEmail
                ? 'No leads match the current filters.'
                : 'Create your first lead to start tracking.'
            }
          />
        </div>
      ) : (
        <LeadTable
          leads={leads}
          onView={setViewing}
          onEdit={setEditing}
          onDelete={(l) => void handleDelete(l)}
        />
      )}

      {meta && meta.totalPages > 1 ? (
        <div className="px-4 md:px-7 mt-4 flex items-center justify-between text-xs text-secondary">
          <span>
            Page {meta.page} of {meta.totalPages}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={meta.page <= 1}
              className="inline-flex items-center gap-1 px-2 py-1 rounded-lg border border-border hover:bg-primary/5 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={14} />
              Prev
            </button>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
              disabled={meta.page >= meta.totalPages}
              className="inline-flex items-center gap-1 px-2 py-1 rounded-lg border border-border hover:bg-primary/5 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Next
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      ) : null}

      {viewing ? (
        <LeadDetail
          lead={viewing}
          onClose={() => setViewing(null)}
          onEdit={(l) => {
            setViewing(null);
            setEditing(l);
          }}
        />
      ) : null}

      {creating ? (
        <LeadForm
          submitting={createMut.isPending}
          onSubmit={(v) => void handleCreate(v)}
          onClose={() => setCreating(false)}
        />
      ) : null}

      {editing ? (
        <LeadForm
          initial={editing}
          submitting={updateMut.isPending}
          onSubmit={(v) => void handleUpdate(v)}
          onClose={() => setEditing(null)}
        />
      ) : null}
    </>
  );
};
