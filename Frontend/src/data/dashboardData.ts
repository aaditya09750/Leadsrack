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
export const KPI_METRICS = [
  {
    key: 'views',
    title: 'Views',
    value: '721K',
    change: '+11.01%',
    positive: true,
    bgKey: 'views',
  },
  {
    key: 'visits',
    title: 'Visits',
    value: '367K',
    change: '-0.03%',
    positive: false,
    bgKey: 'visits',
  },
  {
    key: 'newUsers',
    title: 'New Users',
    value: '1,156',
    change: '+15.03%',
    positive: true,
    bgKey: 'newUsers',
  },
  {
    key: 'activeUsers',
    title: 'Active Users',
    value: '239K',
    change: '+6.08%',
    positive: true,
    bgKey: 'activeUsers',
  },
] as const;

// ---------- User chart (UserChart) ----------
export const USER_CHART = {
  xAxis: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
  series: [
    {
      name: 'Current Week',
      data: [12, 18, 14, 22, 16, 24, 20],
      color: '#C6C7F8',
      dashed: false,
    },
    {
      name: 'Previous Week',
      data: [8, 12, 10, 15, 12, 18, 14],
      color: '#A8C5DA',
      dashed: true,
    },
  ],
} as const;

// ---------- Traffic by website (TrafficByWebsite) ----------
export const TRAFFIC_BY_WEBSITE = [
  { name: 'Google', value: 80, active: false },
  { name: 'YouTube', value: 60, active: false },
  { name: 'Instagram', value: 90, active: true },
  { name: 'Pinterest', value: 50, active: false },
  { name: 'Facebook', value: 70, active: false },
  { name: 'Twitter', value: 40, active: false },
  { name: 'Tumblr', value: 30, active: false },
] as const;

// ---------- Traffic by device (TrafficByDevice) ----------
// `color` is a token suffix: bg-accent-<color>
export const TRAFFIC_BY_DEVICE = [
  { label: 'Linux', value: 40, color: 'indigo' },
  { label: 'Mac', value: 65, color: 'green' },
  { label: 'iOS', value: 50, color: 'purple' },
  { label: 'Windows', value: 85, color: 'sky' },
  { label: 'Android', value: 30, color: 'blue' },
  { label: 'Other', value: 65, color: 'teal' },
] as const;

// ---------- Traffic by location (TrafficByLocation) ----------
// Donut segments derive from `percentage`. Total should sum to 100.
export const TRAFFIC_BY_LOCATION = [
  { country: 'United States', percentage: 38.6, color: 'purple' },
  { country: 'Canada', percentage: 22.5, color: 'green' },
  { country: 'Mexico', percentage: 30.8, color: 'indigo' },
  { country: 'Other', percentage: 8.1, color: 'sky' },
] as const;

// ---------- Marketing monthly (MarketingMonthly) ----------
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
] as const;
