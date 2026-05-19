// Source of truth for the static dashboard surface seeded into Mongo.
// Mirrors the shape of `Frontend/src/data/dashboardData.ts` but lives independently
// on the backend so there is no cross-app import.
//
// Relations:
//   - ACTIVITIES.actorEmail     → seeder resolves to User._id
//   - CONTACTS.linkedUserEmail  → optional; seeder resolves to User._id when present
//   - NOTIFICATIONS.audience    → string filter applied in the route handler

export type NotificationAudience = 'admin' | 'sales' | 'all';

interface RelativeOffset {
  minutesAgo?: number;
  hoursAgo?: number;
  daysAgo?: number;
}

export interface NotificationSeed extends RelativeOffset {
  kind: string;
  message: string;
  audience: NotificationAudience;
}

export interface ActivitySeed extends RelativeOffset {
  actorEmail: string;
  action: string;
}

export type ContactSeed =
  | { name: string; linkedUserEmail: string; avatar: string }
  | { name: string; email: string; avatar: string };

export interface KpiSeed {
  key: string;
  title: string;
  value: string;
  change: string;
  positive: boolean;
  bgKey: string;
}

export interface ChartSeriesSeed {
  name: string;
  data: number[];
  color: string;
  dashed: boolean;
}

export interface UserChartSeed {
  chartKey: string;
  xAxis: string[];
  series: ChartSeriesSeed[];
}

// ---------- Notifications ----------
export const NOTIFICATIONS: NotificationSeed[] = [
  { kind: 'bug', message: 'Lead duplication detected on import.', audience: 'admin', minutesAgo: 2 },
  { kind: 'user', message: 'Aaditya Gunjal joined as a sales user.', audience: 'admin', hoursAgo: 1 },
  { kind: 'lead-status', message: '3 leads moved to Qualified this morning.', audience: 'all', hoursAgo: 3 },
  { kind: 'subscribe', message: 'You have 12 new Instagram-sourced leads.', audience: 'sales', hoursAgo: 5 },
  { kind: 'bug', message: 'CSV export queued for >1k rows.', audience: 'admin', hoursAgo: 8 },
  { kind: 'lead-status', message: 'Weekly summary: 14 new, 5 lost.', audience: 'all', daysAgo: 1 },
];

// ---------- Activities ----------
export const ACTIVITIES: ActivitySeed[] = [
  { actorEmail: 'admin@leadsrack.local', action: 'Released filter improvements to all users.', minutesAgo: 5 },
  { actorEmail: 'sales@leadsrack.local', action: 'Created 3 leads from Instagram source.', minutesAgo: 35 },
  { actorEmail: 'aadigunjal0975@gmail.com', action: 'Moved a Qualified lead to Contacted.', hoursAgo: 2 },
  { actorEmail: 'sales@leadsrack.local', action: 'Exported 25 leads to CSV.', hoursAgo: 6 },
  { actorEmail: 'admin@leadsrack.local', action: 'Updated role permissions.', hoursAgo: 12 },
  { actorEmail: 'aadigunjal0975@gmail.com', action: 'Marked 2 leads as Lost.', daysAgo: 1 },
  { actorEmail: 'sales@leadsrack.local', action: 'Logged in from a new device.', daysAgo: 2 },
];

// ---------- Contacts ----------
export const CONTACTS: ContactSeed[] = [
  { name: 'Admin User', linkedUserEmail: 'admin@leadsrack.local', avatar: 'https://i.pravatar.cc/150?u=admin' },
  { name: 'Sales User', linkedUserEmail: 'sales@leadsrack.local', avatar: 'https://i.pravatar.cc/150?u=sales' },
  { name: 'Aaditya Gunjal', linkedUserEmail: 'aadigunjal0975@gmail.com', avatar: 'https://i.pravatar.cc/150?u=aaditya' },
  { name: 'Natali Craig', email: 'natali.craig@example.com', avatar: 'https://i.pravatar.cc/150?u=natali' },
  { name: 'Drew Cano', email: 'drew.cano@example.com', avatar: 'https://i.pravatar.cc/150?u=drew' },
  { name: 'Orlando Diggs', email: 'orlando.d@example.com', avatar: 'https://i.pravatar.cc/150?u=orlando' },
  { name: 'Kate Morrison', email: 'kate.m@example.com', avatar: 'https://i.pravatar.cc/150?u=kate' },
  { name: 'Koray Okumus', email: 'koray.o@example.com', avatar: 'https://i.pravatar.cc/150?u=koray' },
];

// ---------- KPIs ----------
export const KPI_METRICS: KpiSeed[] = [
  { key: 'views', title: 'Views', value: '721K', change: '+11.01%', positive: true, bgKey: 'views' },
  { key: 'visits', title: 'Visits', value: '367K', change: '-0.03%', positive: false, bgKey: 'visits' },
  { key: 'newUsers', title: 'New Users', value: '1,156', change: '+15.03%', positive: true, bgKey: 'newUsers' },
  { key: 'activeUsers', title: 'Active Users', value: '239K', change: '+6.08%', positive: true, bgKey: 'activeUsers' },
];

// ---------- User chart ----------
export const USER_CHART: UserChartSeed = {
  chartKey: 'userChart',
  xAxis: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
  series: [
    { name: 'Current Week', data: [12, 18, 14, 22, 16, 24, 20], color: '#C6C7F8', dashed: false },
    { name: 'Previous Week', data: [8, 12, 10, 15, 12, 18, 14], color: '#A8C5DA', dashed: true },
  ],
};

// ---------- Traffic aggregates ----------
export const TRAFFIC_BY_WEBSITE = [
  { name: 'Google', value: 80, active: false },
  { name: 'YouTube', value: 60, active: false },
  { name: 'Instagram', value: 90, active: true },
  { name: 'Pinterest', value: 50, active: false },
  { name: 'Facebook', value: 70, active: false },
  { name: 'Twitter', value: 40, active: false },
  { name: 'Tumblr', value: 30, active: false },
];

export const TRAFFIC_BY_DEVICE = [
  { label: 'Linux', value: 40, color: 'indigo' },
  { label: 'Mac', value: 65, color: 'green' },
  { label: 'iOS', value: 50, color: 'purple' },
  { label: 'Windows', value: 85, color: 'sky' },
  { label: 'Android', value: 30, color: 'blue' },
  { label: 'Other', value: 65, color: 'teal' },
];

export const TRAFFIC_BY_LOCATION = [
  { country: 'United States', percentage: 38.6, color: 'purple' },
  { country: 'Canada', percentage: 22.5, color: 'green' },
  { country: 'Mexico', percentage: 30.8, color: 'indigo' },
  { country: 'Other', percentage: 8.1, color: 'sky' },
];

export const MARKETING_MONTHLY = [
  { month: 'Jan', value: 40, color: 'indigo' },
  { month: 'Feb', value: 65, color: 'green' },
  { month: 'Mar', value: 50, color: 'purple' },
  { month: 'Apr', value: 85, color: 'sky' },
  { month: 'May', value: 30, color: 'blue' },
  { month: 'Jun', value: 65, color: 'teal' },
  { month: 'Jul', value: 40, color: 'indigo' },
  { month: 'Aug', value: 65, color: 'green' },
  { month: 'Sep', value: 50, color: 'purple' },
  { month: 'Oct', value: 85, color: 'sky' },
  { month: 'Nov', value: 30, color: 'blue' },
  { month: 'Dec', value: 65, color: 'teal' },
];

export function relativeDate(input: RelativeOffset): Date {
  const ms =
    (input.minutesAgo ?? 0) * 60_000 +
    (input.hoursAgo ?? 0) * 3_600_000 +
    (input.daysAgo ?? 0) * 86_400_000;
  return new Date(Date.now() - ms);
}
