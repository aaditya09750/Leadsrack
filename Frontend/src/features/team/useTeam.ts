import { useQuery } from '@tanstack/react-query';
import { getTeam } from '../../api/team';

export const teamKeys = {
  overview: ['team', 'overview'] as const,
};

interface UseTeamOptions {
  enabled?: boolean;
}

export function useTeam(options: UseTeamOptions = {}) {
  return useQuery({
    queryKey: teamKeys.overview,
    queryFn: getTeam,
    enabled: options.enabled ?? true,
  });
}
