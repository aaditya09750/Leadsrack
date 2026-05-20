// Centralised data source for every static dashboard surface.
// Stage 1: components import directly from here.
// Stage 2 (after review): the same shapes get seeded into MongoDB and served via API.
//
// Relations:
//   - ACTIVITIES.actorEmail        → must match a User in DB (stage 2 resolves to User._id)
//   - CONTACTS.linkedUserEmail     → optional link to a system user; absence means external contact
//   - NOTIFICATIONS.audience       → 'admin' / 'sales' / 'all' for role-based visibility

// ---------- Notifications (RightDrawer) ----------
export const NOTIFICATIONS = [
  {
    kind: 'bug',
    message: 'Lead duplication detected on import.',
    audience: 'admin',
    minutesAgo: 2,
  },
  {
    kind: 'user',
    message: 'Aaditya Gunjal joined as a sales user.',
    audience: 'admin',
    hoursAgo: 1,
  },
  {
    kind: 'lead-status',
    message: '3 leads moved to Qualified this morning.',
    audience: 'all',
    hoursAgo: 3,
  },
  {
    kind: 'subscribe',
    message: 'You have 12 new Instagram-sourced leads.',
    audience: 'sales',
    hoursAgo: 5,
  },
  {
    kind: 'bug',
    message: 'CSV export queued for >1k rows.',
    audience: 'admin',
    hoursAgo: 8,
  },
  {
    kind: 'lead-status',
    message: 'Weekly summary: 14 new, 5 lost.',
    audience: 'all',
    daysAgo: 1,
  },
] as const;

// ---------- Activities (RightDrawer) ----------
export const ACTIVITIES = [
  {
    actorEmail: 'admin@leadsrack.local',
    actorName: 'Admin User',
    action: 'Released filter improvements to all users.',
    minutesAgo: 5,
  },
  {
    actorEmail: 'sales@leadsrack.local',
    actorName: 'Sales User',
    action: 'Created 3 leads from Instagram source.',
    minutesAgo: 35,
  },
  {
    actorEmail: 'aadigunjal0975@gmail.com',
    actorName: 'Aaditya Gunjal',
    action: 'Moved a Qualified lead to Contacted.',
    hoursAgo: 2,
  },
  {
    actorEmail: 'sales@leadsrack.local',
    actorName: 'Sales User',
    action: 'Exported 25 leads to CSV.',
    hoursAgo: 6,
  },
  {
    actorEmail: 'admin@leadsrack.local',
    actorName: 'Admin User',
    action: 'Updated role permissions.',
    hoursAgo: 12,
  },
  {
    actorEmail: 'aadigunjal0975@gmail.com',
    actorName: 'Aaditya Gunjal',
    action: 'Marked 2 leads as Lost.',
    daysAgo: 1,
  },
  {
    actorEmail: 'sales@leadsrack.local',
    actorName: 'Sales User',
    action: 'Logged in from a new device.',
    daysAgo: 2,
  },
] as const;

// ---------- Contacts (RightDrawer) ----------
export const CONTACTS = [
  {
    name: 'Admin User',
    linkedUserEmail: 'admin@leadsrack.local',
    avatar: 'https://i.pravatar.cc/150?u=admin',
  },
  {
    name: 'Sales User',
    linkedUserEmail: 'sales@leadsrack.local',
    avatar: 'https://i.pravatar.cc/150?u=sales',
  },
  {
    name: 'Aaditya Gunjal',
    linkedUserEmail: 'aadigunjal0975@gmail.com',
    avatar: 'https://i.pravatar.cc/150?u=aaditya',
  },
  {
    name: 'Natali Craig',
    email: 'natali.craig@example.com',
    avatar: 'https://i.pravatar.cc/150?u=natali',
  },
  {
    name: 'Drew Cano',
    email: 'drew.cano@example.com',
    avatar: 'https://i.pravatar.cc/150?u=drew',
  },
  {
    name: 'Orlando Diggs',
    email: 'orlando.d@example.com',
    avatar: 'https://i.pravatar.cc/150?u=orlando',
  },
  {
    name: 'Kate Morrison',
    email: 'kate.m@example.com',
    avatar: 'https://i.pravatar.cc/150?u=kate',
  },
  {
    name: 'Koray Okumus',
    email: 'koray.o@example.com',
    avatar: 'https://i.pravatar.cc/150?u=koray',
  },
] as const;

// ---------- KPI metrics (StatsGrid) ----------
// Offline-fallback values shown for the brief pre-fetch flash. Matches the
// lead-derived KPI shape that the backend emits (keys + Tailwind bgKey aliases).
import type { TrafficMarketingRow, UserChartData, UserChartPivots } from '../types/dashboard';

export const KPI_METRICS = [
  {
    key: 'totalLeads',
    title: 'Total Leads',
    value: '0',
    change: '',
    positive: true,
    bgKey: 'totalLeads',
  },
  {
    key: 'newLeads',
    title: 'New',
    value: '0',
    change: '',
    positive: true,
    bgKey: 'newLeads',
  },
  {
    key: 'qualifiedLeads',
    title: 'Qualified',
    value: '0',
    change: '',
    positive: true,
    bgKey: 'qualifiedLeads',
  },
  {
    key: 'conversionRate',
    title: 'Conversion Rate',
    value: '0.0%',
    change: '',
    positive: true,
    bgKey: 'conversionRate',
  },
] as const;

// ---------- User chart (UserChart) ----------
const EMPTY_USER_CHART: UserChartData = {
  xAxis: [],
  series: [
    { name: 'Current', data: [], color: '#C6C7F8', dashed: false },
    { name: 'Previous', data: [], color: '#A8C5DA', dashed: true },
  ],
};

const EMPTY_PIVOTS: UserChartPivots = {
  totalLeads: EMPTY_USER_CHART,
  qualified: EMPTY_USER_CHART,
  conversion: EMPTY_USER_CHART,
};

export const USER_CHART: UserChartData & { pivots: UserChartPivots } = {
  ...EMPTY_USER_CHART,
  pivots: EMPTY_PIVOTS,
};

// ---------- Traffic by website (TrafficByWebsite) ----------
export const TRAFFIC_BY_WEBSITE = [
  { name: 'New', value: 0, active: false },
  { name: 'Contacted', value: 0, active: false },
  { name: 'Qualified', value: 0, active: false },
  { name: 'Lost', value: 0, active: false },
] as const;

// ---------- Traffic by device (TrafficByDevice) ----------
// `color` is a token suffix: bg-accent-<color>
export const TRAFFIC_BY_DEVICE = [
  { label: 'Website', value: 0, color: 'sky' },
  { label: 'Instagram', value: 0, color: 'purple' },
  { label: 'Referral', value: 0, color: 'green' },
] as const;

// ---------- Traffic by location (TrafficByLocation) ----------
// Donut segments derive from `percentage`. Total should sum to 100.
export const TRAFFIC_BY_LOCATION: ReadonlyArray<{
  country: string;
  percentage: number;
  color: string;
}> = [];

// ---------- Marketing monthly (MarketingMonthly) ----------
const MONTHLY_COLOR_CYCLE = ['indigo', 'green', 'purple', 'sky', 'blue', 'teal'] as const;
const MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

// 12 zero-bars labelled with the trailing 12 calendar months ending "now".
// Computed at module-load so the placeholder axis matches what the API will
// return on the first fetch.
function rollingMonthlyFallback(): TrafficMarketingRow[] {
  const now = new Date();
  const out: TrafficMarketingRow[] = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    out.push({
      month: MONTH_NAMES[d.getMonth()] ?? '',
      value: 0,
      color: MONTHLY_COLOR_CYCLE[(11 - i) % MONTHLY_COLOR_CYCLE.length] ?? 'indigo',
      count: 0,
    });
  }
  return out;
}

export const MARKETING_MONTHLY: TrafficMarketingRow[] = rollingMonthlyFallback();
