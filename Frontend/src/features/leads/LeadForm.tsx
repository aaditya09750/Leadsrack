import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X } from 'lucide-react';
import { Select } from '../../components/ui/Select';
import {
  LEAD_STATUSES,
  LEAD_SOURCES,
  type Lead,
  type LeadStatus,
  type LeadSource,
} from '../../types/api';

const leadFormSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(100),
  email: z.string().email('Invalid email').max(254),
  status: z.enum(['New', 'Contacted', 'Qualified', 'Lost']),
  source: z.enum(['Website', 'Instagram', 'Referral']),
});

export type LeadFormValues = z.infer<typeof leadFormSchema>;

interface LeadFormProps {
  initial?: Lead | null;
  submitting: boolean;
  onSubmit: (values: LeadFormValues) => void;
  onClose: () => void;
}

const inputClass =
  'w-full px-3 py-2 rounded-lg bg-primary/5 border border-border text-primary text-sm placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-accent-brand';

const STATUS_OPTIONS = LEAD_STATUSES.map((s) => ({ value: s, label: s }));
const SOURCE_OPTIONS = LEAD_SOURCES.map((s) => ({ value: s, label: s }));

export const LeadForm = ({ initial, submitting, onSubmit, onClose }: LeadFormProps) => {
  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<LeadFormValues>({
    resolver: zodResolver(leadFormSchema),
    defaultValues: {
      name: initial?.name ?? '',
      email: initial?.email ?? '',
      status: (initial?.status as LeadStatus) ?? 'New',
      source: (initial?.source as LeadSource) ?? 'Website',
    },
  });

  useEffect(() => {
    reset({
      name: initial?.name ?? '',
      email: initial?.email ?? '',
      status: (initial?.status as LeadStatus) ?? 'New',
      source: (initial?.source as LeadSource) ?? 'Website',
    });
  }, [initial, reset]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-6">
      <div className="w-full max-w-md bg-background border border-border rounded-xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h2 className="font-display text-primary text-base font-semibold">
            {initial ? 'Edit lead' : 'New lead'}
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

        <form onSubmit={handleSubmit(onSubmit)} className="p-5 space-y-4" noValidate>
          <div>
            <label htmlFor="lead-name" className="block text-secondary text-xs mb-1.5">
              Name
            </label>
            <input id="lead-name" {...register('name')} className={inputClass} placeholder="Lead full name" />
            {errors.name ? (
              <p role="alert" className="text-xs text-red-400 mt-1">
                {errors.name.message}
              </p>
            ) : null}
          </div>

          <div>
            <label htmlFor="lead-email" className="block text-secondary text-xs mb-1.5">
              Email
            </label>
            <input
              id="lead-email"
              type="email"
              {...register('email')}
              className={inputClass}
              placeholder="lead@example.com"
            />
            {errors.email ? (
              <p role="alert" className="text-xs text-red-400 mt-1">
                {errors.email.message}
              </p>
            ) : null}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="lead-status" className="block text-secondary text-xs mb-1.5">
                Status
              </label>
              <Controller
                control={control}
                name="status"
                render={({ field }) => (
                  <Select
                    id="lead-status"
                    value={field.value}
                    onChange={(v) => field.onChange(v as LeadStatus)}
                    options={STATUS_OPTIONS}
                    size="md"
                    aria-label="Status"
                  />
                )}
              />
            </div>
            <div>
              <label htmlFor="lead-source" className="block text-secondary text-xs mb-1.5">
                Source
              </label>
              <Controller
                control={control}
                name="source"
                render={({ field }) => (
                  <Select
                    id="lead-source"
                    value={field.value}
                    onChange={(v) => field.onChange(v as LeadSource)}
                    options={SOURCE_OPTIONS}
                    size="md"
                    aria-label="Source"
                  />
                )}
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg text-secondary text-xs hover:bg-primary/5 hover:text-primary transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-3 py-1.5 rounded-lg bg-accent-brand text-white text-xs font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {submitting ? 'Saving…' : initial ? 'Save changes' : 'Create lead'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
