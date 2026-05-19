import 'dotenv/config';
import { connectDB, disconnectDB } from './config/db.js';
import { User, type Role, type UserDoc } from './models/User.js';
import {
  Lead,
  LEAD_STATUSES,
  LEAD_SOURCES,
  type LeadStatus,
  type LeadSource,
} from './models/Lead.js';
import { Notification } from './models/Notification.js';
import { Activity } from './models/Activity.js';
import { Contact } from './models/Contact.js';
import { DashboardKpi } from './models/DashboardKpi.js';
import { ChartSeries } from './models/ChartSeries.js';
import { TrafficAggregate } from './models/TrafficAggregate.js';
import { logger } from './lib/logger.js';
import {
  NOTIFICATIONS,
  ACTIVITIES,
  CONTACTS,
  KPI_METRICS,
  USER_CHART,
  TRAFFIC_BY_WEBSITE,
  TRAFFIC_BY_DEVICE,
  TRAFFIC_BY_LOCATION,
  MARKETING_MONTHLY,
  relativeDate,
} from './data/dashboardSeed.js';

const FIRST_NAMES = [
  'Aarav', 'Vivaan', 'Aaditya', 'Vihaan', 'Arjun', 'Sai', 'Reyansh', 'Ayaan', 'Krishna',
  'Ishaan', 'Rohan', 'Kabir', 'Rahul', 'Aniket', 'Dev', 'Priya', 'Ananya', 'Diya', 'Aanya',
];
const LAST_NAMES = ['Sharma', 'Verma', 'Gupta', 'Mehta', 'Patel', 'Khan', 'Singh', 'Iyer', 'Nair', 'Rao'];

function pick<T>(arr: readonly T[]): T {
  const idx = Math.floor(Math.random() * arr.length);
  const v = arr[idx];
  if (v === undefined) throw new Error('pick from empty array');
  return v;
}

interface UserSpec {
  name: string;
  email: string;
  password: string;
  role: Role;
}

// Find-or-create. Keeps the seed idempotent across partial failures —
// if a prior run created some users but crashed before completing, re-running
// the seed fills in the missing ones rather than skipping entirely.
async function ensureUser(spec: UserSpec): Promise<{ user: UserDoc; created: boolean }> {
  const existing = await User.findOne({ email: spec.email });
  if (existing) return { user: existing, created: false };
  const passwordHash = await User.hashPassword(spec.password);
  const user = await User.create({
    name: spec.name,
    email: spec.email,
    passwordHash,
    role: spec.role,
  });
  return { user, created: true };
}

async function seedUsersAndLeads(): Promise<void> {
  const adminResult = await ensureUser({
    name: 'Admin User',
    email: 'admin@leadsrack.local',
    password: 'admin123!',
    role: 'admin',
  });
  const salesResult = await ensureUser({
    name: 'Sales User',
    email: 'sales@leadsrack.local',
    password: 'sales123!',
    role: 'sales',
  });
  const aadityaResult = await ensureUser({
    name: 'Aaditya Gunjal',
    email: 'aadigunjal0975@gmail.com',
    password: 'aaditya123!',
    role: 'sales',
  });

  const admin = adminResult.user;
  const sales = salesResult.user;
  const aaditya = aadityaResult.user;
  const usersCreated = [adminResult, salesResult, aadityaResult].filter((r) => r.created).length;

  const leadCount = await Lead.countDocuments();
  if (leadCount > 0) {
    logger.info(
      { usersCreated, existingLeads: leadCount },
      'users ensured; leads already exist (skipped lead seed)',
    );
    return;
  }

  // Distribute 25 leads across all three users so the Team page has variety.
  const leads = Array.from({ length: 25 }, () => {
    const first = pick(FIRST_NAMES);
    const last = pick(LAST_NAMES);
    const status: LeadStatus = pick(LEAD_STATUSES);
    const source: LeadSource = pick(LEAD_SOURCES);
    const r = Math.random();
    const createdBy = r < 0.4 ? sales._id : r < 0.75 ? aaditya._id : admin._id;
    return {
      name: `${first} ${last}`,
      email: `${first}.${last}@example.com`.toLowerCase(),
      status,
      source,
      createdBy,
    };
  });
  await Lead.insertMany(leads);

  logger.info(
    {
      usersCreated,
      admin: admin.email,
      sales: sales.email,
      aaditya: aaditya.email,
      leadsInserted: leads.length,
      defaultPasswords: {
        admin: 'admin123!',
        sales: 'sales123!',
        aaditya: 'aaditya123!',
      },
    },
    'users + leads seed complete',
  );
}

async function seedDashboard(): Promise<void> {
  // Reference data: drop + reinsert every run. Predictable, idempotent across re-runs.
  await Promise.all([
    Notification.deleteMany({}),
    Activity.deleteMany({}),
    Contact.deleteMany({}),
    DashboardKpi.deleteMany({}),
    ChartSeries.deleteMany({}),
    TrafficAggregate.deleteMany({}),
  ]);

  // Resolve emails → User ObjectIds for relations.
  const users = await User.find({}, { email: 1 }).lean();
  const userByEmail = new Map(users.map((u) => [u.email, u._id]));

  await Notification.insertMany(
    NOTIFICATIONS.map((n) => ({
      kind: n.kind,
      message: n.message,
      audience: n.audience,
      createdAt: relativeDate(n),
    })),
  );

  await Activity.insertMany(
    ACTIVITIES.map((a) => {
      const actorId = userByEmail.get(a.actorEmail);
      if (!actorId) {
        throw new Error(
          `Activity references unknown actorEmail "${a.actorEmail}" — seed the user first.`,
        );
      }
      return { actor: actorId, action: a.action, createdAt: relativeDate(a) };
    }),
  );

  await Contact.insertMany(
    CONTACTS.map((c) => {
      if ('linkedUserEmail' in c) {
        const linkedUser = userByEmail.get(c.linkedUserEmail);
        if (!linkedUser) {
          throw new Error(
            `Contact references unknown linkedUserEmail "${c.linkedUserEmail}".`,
          );
        }
        return { name: c.name, avatar: c.avatar, linkedUser };
      }
      return { name: c.name, email: c.email, avatar: c.avatar };
    }),
  );

  await DashboardKpi.insertMany(KPI_METRICS.map((k, i) => ({ ...k, order: i })));

  await ChartSeries.create({
    chartKey: USER_CHART.chartKey,
    xAxis: USER_CHART.xAxis,
    series: USER_CHART.series,
  });

  await TrafficAggregate.insertMany([
    { kind: 'website', rows: TRAFFIC_BY_WEBSITE },
    { kind: 'device', rows: TRAFFIC_BY_DEVICE },
    { kind: 'location', rows: TRAFFIC_BY_LOCATION },
    { kind: 'marketing', rows: MARKETING_MONTHLY },
  ]);

  logger.info(
    {
      notifications: NOTIFICATIONS.length,
      activities: ACTIVITIES.length,
      contacts: CONTACTS.length,
      kpis: KPI_METRICS.length,
      chartSeries: 1,
      trafficAggregates: 4,
    },
    'dashboard seed complete',
  );
}

async function main(): Promise<void> {
  await connectDB();
  try {
    await seedUsersAndLeads();
    await seedDashboard();
  } finally {
    await disconnectDB();
  }
}

main().catch((err) => {
  logger.fatal({ err }, 'seed failed');
  process.exit(1);
});
