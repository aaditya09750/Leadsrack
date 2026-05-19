import { api } from '../lib/api';
import type {
  DashboardOverview,
  NotificationDoc,
  ActivityDoc,
  ContactDoc,
} from '../types/dashboard';

interface Envelope<T> {
  data: T;
}

export async function getDashboardOverview(): Promise<DashboardOverview> {
  const res = await api.get<Envelope<DashboardOverview>>('/dashboard/overview');
  return res.data.data;
}

export async function getNotifications(): Promise<NotificationDoc[]> {
  const res = await api.get<Envelope<NotificationDoc[]>>('/notifications');
  return res.data.data;
}

export async function getActivities(): Promise<ActivityDoc[]> {
  const res = await api.get<Envelope<ActivityDoc[]>>('/activities');
  return res.data.data;
}

export async function getContacts(): Promise<ContactDoc[]> {
  const res = await api.get<Envelope<ContactDoc[]>>('/contacts');
  return res.data.data;
}
