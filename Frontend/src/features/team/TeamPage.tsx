import { LoadingSpinner } from '../../components/feedback/LoadingSpinner';
import { ErrorState } from '../../components/feedback/ErrorState';
import { EmptyState } from '../../components/feedback/EmptyState';
import { extractErrorMessage } from '../../lib/api';
import { useTeam } from './useTeam';
import { TeamSummary } from './TeamSummary';
import { TeamTable } from './TeamTable';

export const TeamPage = () => {
  const { data, isLoading, isError, error, refetch } = useTeam();

  return (
    <>
      <div className="px-7 pt-7 pb-2 flex items-center justify-between">
        <div>
          <h1 className="font-display text-primary text-xl font-semibold">Team</h1>
          <p className="text-secondary text-xs mt-1">Sales pipeline by user.</p>
        </div>
      </div>

      <TeamSummary summary={data?.summary} loading={isLoading} />

      {isError ? (
        <div className="px-7">
          <ErrorState message={extractErrorMessage(error)} onRetry={() => void refetch()} />
        </div>
      ) : isLoading ? (
        <div className="px-7">
          <div className="rounded-xl border border-border bg-surface py-12 flex justify-center">
            <LoadingSpinner label="Loading team" />
          </div>
        </div>
      ) : !data || data.members.length === 0 ? (
        <div className="px-7">
          <EmptyState
            title="No team members yet"
            description="Invite users to start building the team."
          />
        </div>
      ) : (
        <TeamTable members={data.members} />
      )}
    </>
  );
};
