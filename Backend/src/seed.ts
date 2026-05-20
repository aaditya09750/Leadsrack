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
import { logger } from './lib/logger.js';
import {
  NOTIFICATIONS,
  ACTIVITIES,
  CONTACTS,
  relativeDate,
} from './data/dashboardSeed.js';

const HOUR_MS = 60 * 60 * 1000;

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

// Spread `createdAt` across the past ~12 months, weighted toward recent:
//   40% in last 30 days, 30% in 30-90 days, 20% in 90-180 days, 10% in 180-365 days.
// Ensures the dashboard's monthly / trend charts have visual shape on a fresh seed.
function randomPastDate(): Date {
  const r = Math.random();
  const daysAgo =
    r < 0.4
      ? Math.random() * 30
      : r < 0.7
        ? 30 + Math.random() * 60
        : r < 0.9
          ? 90 + Math.random() * 90
          : 180 + Math.random() * 185;
  const d = new Date();
  d.setDate(d.getDate() - Math.floor(daysAgo));
  d.setHours(
    Math.floor(Math.random() * 24),
    Math.floor(Math.random() * 60),
    Math.floor(Math.random() * 60),
    0,
  );
  return d;
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

  // Opt-in override: `FORCE_RESEED=1 pnpm seed` always drops the leads collection
  // and reseeds from scratch with the date-spread distribution. Useful for refreshing
  // a dev DB whose leads happen to be bunched in one or two months.
  const forceReseed = process.env.FORCE_RESEED === '1' || process.env.FORCE_RESEED === 'true';

  const leadCount = await Lead.countDocuments();
  if (leadCount > 0 && !forceReseed) {
    // Detect the pre-spread state: all existing leads have near-identical
    // createdAt (within an hour). That's the original seed shape — drop and
    // re-seed with date-spread so the dashboard's trend charts show shape.
    // Otherwise (spread > 1h) treat the existing data as intentional and skip.
    const [span] = await Lead.aggregate<{ min: Date; max: Date }>([
      { $group: { _id: null, min: { $min: '$createdAt' }, max: { $max: '$createdAt' } } },
      { $project: { _id: 0, min: 1, max: 1 } },
    ]);
    const spreadMs = span ? span.max.getTime() - span.min.getTime() : 0;
    if (spreadMs > HOUR_MS) {
      logger.info(
        { usersCreated, existingLeads: leadCount, spreadHours: Math.round(spreadMs / HOUR_MS) },
        'users ensured; leads already exist and are date-spread (skipped lead seed; set FORCE_RESEED=1 to override)',
      );
      return;
    }
    logger.info(
      { usersCreated, existingLeads: leadCount },
      'users ensured; existing leads collapsed to one timestamp — re-seeding with date spread',
    );
    await Lead.deleteMany({});
  } else if (leadCount > 0 && forceReseed) {
    logger.info(
      { usersCreated, existingLeads: leadCount },
      'FORCE_RESEED=1 set — dropping existing leads and re-seeding with date spread',
    );
    await Lead.deleteMany({});
  }

  // Distribute 25 leads across all three users so the Team page has variety.
  // Each lead's createdAt is spread across the past 12 months (see randomPastDate)
  // so the dashboard's monthly and trend charts have meaningful shape.
  const leads = Array.from({ length: 25 }, () => {
    const first = pick(FIRST_NAMES);
    const last = pick(LAST_NAMES);
    const status: LeadStatus = pick(LEAD_STATUSES);
    const source: LeadSource = pick(LEAD_SOURCES);
    const r = Math.random();
    const createdBy = r < 0.4 ? sales._id : r < 0.75 ? aaditya._id : admin._id;
    const createdAt = randomPastDate();
    return {
      name: `${first} ${last}`,
      email: `${first}.${last}@example.com`.toLowerCase(),
      status,
      source,
      createdBy,
      createdAt,
      updatedAt: createdAt,
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
  // Reference data for the RightDrawer (Notifications / Activities / Contacts).
  // The main dashboard widgets are now derived from the Lead collection by the
  // services/dashboard.ts aggregation — no static KPI / chart / traffic seed.
  await Promise.all([
    Notification.deleteMany({}),
    Activity.deleteMany({}),
    Contact.deleteMany({}),
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

  logger.info(
    {
      notifications: NOTIFICATIONS.length,
      activities: ACTIVITIES.length,
      contacts: CONTACTS.length,
    },
    'right-drawer seed complete (dashboard widgets are derived from leads)',
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
