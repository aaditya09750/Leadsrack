import { useQuery } from '@tanstack/react-query';
import {
  getDashboardOverview,
  getNotifications,
  getActivities,
  getContacts,
} from '../../api/dashboard';

export const dashboardKeys = {
  overview: ['dashboard', 'overview'] as const,
  notifications: ['notifications'] as const,
  activities: ['activities'] as const,
  contacts: ['contacts'] as const,
};

export function useDashboardOverview() {
  return useQuery({
    queryKey: dashboardKeys.overview,
    queryFn: getDashboardOverview,
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
