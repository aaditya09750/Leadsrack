import 'dotenv/config';
import { connectDB, disconnectDB } from './config/db.js';
import { User } from './models/User.js';
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

async function seedUsersAndLeads(): Promise<void> {
  const userCount = await User.countDocuments();
  if (userCount > 0) {
    logger.info({ userCount }, 'users already exist — user/lead seed skipped');
    return;
  }

  const adminHash = await User.hashPassword('admin123!');
  const salesHash = await User.hashPassword('sales123!');

  const admin = await User.create({
    name: 'Admin User',
    email: 'admin@leadsrack.local',
    passwordHash: adminHash,
    role: 'admin',
  });
  const sales = await User.create({
    name: 'Sales User',
    email: 'sales@leadsrack.local',
    passwordHash: salesHash,
    role: 'sales',
  });

  const leads = Array.from({ length: 25 }, () => {
    const first = pick(FIRST_NAMES);
    const last = pick(LAST_NAMES);
    const status: LeadStatus = pick(LEAD_STATUSES);
    const source: LeadSource = pick(LEAD_SOURCES);
    const createdBy = Math.random() < 0.7 ? sales._id : admin._id;
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
      admin: admin.email,
      sales: sales.email,
      leadsInserted: leads.length,
      defaultPasswords: { admin: 'admin123!', sales: 'sales123!' },
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
