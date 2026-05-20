import { useQuery } from '@tanstack/react-query';
import {
  getDashboardOverview,
  getNotifications,
  getActivities,
  getContacts,
} from '../../api/dashboard';
import type { PeriodKey } from '../../types/dashboard';

export const dashboardKeys = {
  overview: (period: PeriodKey) => ['dashboard', 'overview', period] as const,
  notifications: ['notifications'] as const,
  activities: ['activities'] as const,
  contacts: ['contacts'] as const,
};

export function useDashboardOverview(period: PeriodKey) {
  return useQuery({
    queryKey: dashboardKeys.overview(period),
    queryFn: () => getDashboardOverview(period),
  });
}

export function useNotifications() {
  return useQuery({
    queryKey: dashboardKeys.notifications,
    queryFn: getNotifications,
  });
}

export function useActivities() {
  return useQuery({
    queryKey: dashboardKeys.activities,
    queryFn: getActivities,
  });
}

export function useContacts() {
  return useQuery({
    queryKey: dashboardKeys.contacts,
    queryFn: getContacts,
  });
}
