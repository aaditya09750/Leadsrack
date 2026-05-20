// Static reference data for the RightDrawer (Notifications / Activities / Contacts).
//
// The main dashboard widgets (KPIs, charts, traffic breakdowns) are NOT seeded —
// they are derived live from the Lead collection by services/dashboard.ts.
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

export function relativeDate(input: RelativeOffset): Date {
  const ms =
    (input.minutesAgo ?? 0) * 60_000 +
    (input.hoursAgo ?? 0) * 3_600_000 +
    (input.daysAgo ?? 0) * 86_400_000;
  return new Date(Date.now() - ms);
}
