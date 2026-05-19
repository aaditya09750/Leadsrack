import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Avatar } from '../../components/ui/Avatar';
import { useAuthStore } from '../../store/authStore';
import type { TeamMember } from '../../types/team';
import type { Role } from '../../types/api';

const ROLE_STYLES: Record<Role, string> = {
  admin: 'bg-accent-purple/20 text-accent-purple',
  sales: 'bg-accent-sky/20 text-accent-sky',
};

interface Props {
  members: TeamMember[];
}

export const TeamTable = ({ members }: Props) => {
  const currentUserId = useAuthStore((s) => s.user?.id);

  return (
    <div className="mx-7 rounded-xl border border-border bg-surface overflow-hidden">
      <table className="w-full text-left text-xs">
        <thead className="bg-primary/[0.03]">
          <tr className="text-secondary uppercase tracking-wider">
            <th className="px-4 py-3 font-medium">Member</th>
            <th className="px-4 py-3 font-medium">Role</th>
            <th className="px-4 py-3 font-medium text-right">Total</th>
            <th className="px-4 py-3 font-medium text-right">New</th>
            <th className="px-4 py-3 font-medium text-right">Contacted</th>
            <th className="px-4 py-3 font-medium text-right">Qualified</th>
            <th className="px-4 py-3 font-medium text-right">Lost</th>
            <th className="px-4 py-3 font-medium text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {members.map((m) => (
            <tr
              key={m.id}
              className="border-t border-border hover:bg-primary/[0.02] transition-colors"
            >
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <Avatar src={m.avatar} alt={m.name} size="sm" />
                  <div className="flex flex-col">
                    <span className="text-primary font-medium">
                      {m.name}
                      {m.id === currentUserId ? (
                        <span className="text-secondary text-[10px] ml-1.5">(you)</span>
                      ) : null}
                    </span>
                    <span className="text-secondary text-[10px]">{m.email}</span>
                  </div>
                </div>
              </td>
              <td className="px-4 py-3">
                <span
                  className={cn(
                    'inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium uppercase tracking-wider',
                    ROLE_STYLES[m.role],
                  )}
                >
                  {m.role}
                </span>
              </td>
              <td className="px-4 py-3 text-right text-primary font-medium">
                {m.leadCounts.total}
              </td>
              <td className="px-4 py-3 text-right text-secondary">{m.leadCounts.byStatus.New}</td>
              <td className="px-4 py-3 text-right text-secondary">
                {m.leadCounts.byStatus.Contacted}
              </td>
              <td className="px-4 py-3 text-right text-secondary">
                {m.leadCounts.byStatus.Qualified}
              </td>
              <td className="px-4 py-3 text-right text-secondary">{m.leadCounts.byStatus.Lost}</td>
              <td className="px-4 py-3 text-right">
                <Link
                  to={`/leads?owner=${encodeURIComponent(m.email)}`}
                  className="inline-flex items-center gap-1 text-accent-brand text-xs hover:underline"
                >
                  View leads
                  <ChevronRight size={12} />
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
