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
import { logger } from './lib/logger.js';

const FIRST_NAMES = [
  'Aarav', 'Vivaan', 'Aditya', 'Vihaan', 'Arjun', 'Sai', 'Reyansh', 'Ayaan', 'Krishna',
  'Ishaan', 'Rohan', 'Kabir', 'Rahul', 'Aniket', 'Dev', 'Priya', 'Ananya', 'Diya', 'Aanya',
];
const LAST_NAMES = ['Sharma', 'Verma', 'Gupta', 'Mehta', 'Patel', 'Khan', 'Singh', 'Iyer', 'Nair', 'Rao'];

function pick<T>(arr: readonly T[]): T {
  const idx = Math.floor(Math.random() * arr.length);
  const v = arr[idx];
  if (v === undefined) throw new Error('pick from empty array');
  return v;
}

async function main(): Promise<void> {
  await connectDB();

  const userCount = await User.countDocuments();
  if (userCount > 0) {
    logger.info({ userCount }, 'users already exist — seed skipped (idempotent)');
    await disconnectDB();
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
    'seed complete',
  );

  await disconnectDB();
}

main().catch((err) => {
  logger.fatal({ err }, 'seed failed');
  process.exit(1);
});
