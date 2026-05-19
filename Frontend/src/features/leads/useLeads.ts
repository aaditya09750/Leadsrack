import { useMutation, useQuery, useQueryClient, type UseMutationResult } from '@tanstack/react-query';
import { createLead, deleteLead, listLeads, updateLead } from '../../api/leads';
import type {
  Lead,
  LeadsQuery,
  LeadStatus,
  LeadSource,
  Paginated,
} from '../../types/api';

export const leadsKeys = {
  all: ['leads'] as const,
  list: (query: LeadsQuery) => ['leads', 'list', query] as const,
};

export function useLeadsQuery(query: LeadsQuery) {
  return useQuery<Paginated<Lead>>({
    queryKey: leadsKeys.list(query),
    queryFn: () => listLeads(query),
  });
}

interface CreateInput {
  name: string;
  email: string;
  status?: LeadStatus;
  source: LeadSource;
}

interface UpdateInput {
  id: string;
  data: Partial<CreateInput>;
}

export function useCreateLead(): UseMutationResult<Lead, Error, CreateInput> {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateInput) => createLead(input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: leadsKeys.all });
    },
  });
}

export function useUpdateLead(): UseMutationResult<Lead, Error, UpdateInput> {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: UpdateInput) => updateLead(id, data),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: leadsKeys.all });
    },
  });
}

export function useDeleteLead(): UseMutationResult<void, Error, string> {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteLead(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: leadsKeys.all });
    },
  });
}
