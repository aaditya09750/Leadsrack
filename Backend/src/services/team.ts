import type { Types } from 'mongoose';
import { User, type Role } from '../models/User.js';
import { Lead, type LeadStatus } from '../models/Lead.js';

interface StatusCounts {
  total: number;
  byStatus: Record<LeadStatus, number>;
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar: string;
  leadCounts: StatusCounts;
}

export interface TeamSummary {
  totalMembers: number;
  adminCount: number;
  salesCount: number;
  totalLeads: number;
  topPerformer: { id: string; name: string; email: string; totalLeads: number } | null;
}

export interface TeamOverview {
  summary: TeamSummary;
  members: TeamMember[];
}

interface LeadAggregateRow {
  _id: Types.ObjectId;
  total: number;
  newCount: number;
  contacted: number;
  qualified: number;
  lost: number;
}

function emptyStatusCounts(): StatusCounts {
  return {
    total: 0,
    byStatus: { New: 0, Contacted: 0, Qualified: 0, Lost: 0 },
  };
}

function avatarFor(email: string): string {
  return `https://i.pravatar.cc/150?u=${encodeURIComponent(email)}`;
}

export async function listTeam(): Promise<TeamOverview> {
  const users = await User.find({}, { name: 1, email: 1, role: 1 }).lean();

  const aggregates = await Lead.aggregate<LeadAggregateRow>([
    {
      $group: {
        _id: '$createdBy',
        total: { $sum: 1 },
        newCount: { $sum: { $cond: [{ $eq: ['$status', 'New'] }, 1, 0] } },
        contacted: { $sum: { $cond: [{ $eq: ['$status', 'Contacted'] }, 1, 0] } },
        qualified: { $sum: { $cond: [{ $eq: ['$status', 'Qualified'] }, 1, 0] } },
        lost: { $sum: { $cond: [{ $eq: ['$status', 'Lost'] }, 1, 0] } },
      },
    },
  ]);

  const aggByCreator = new Map<string, StatusCounts>();
  for (const row of aggregates) {
    aggByCreator.set(String(row._id), {
      total: row.total,
      byStatus: {
        New: row.newCount,
        Contacted: row.contacted,
        Qualified: row.qualified,
        Lost: row.lost,
      },
    });
  }

  const members: TeamMember[] = users.map((u) => ({
    id: String(u._id),
    name: u.name,
    email: u.email,
    role: u.role,
    avatar: avatarFor(u.email),
    leadCounts: aggByCreator.get(String(u._id)) ?? emptyStatusCounts(),
  }));

  members.sort((a, b) => b.leadCounts.total - a.leadCounts.total);

  const totalLeads = members.reduce((sum, m) => sum + m.leadCounts.total, 0);
  const adminCount = members.filter((m) => m.role === 'admin').length;
  const salesCount = members.filter((m) => m.role === 'sales').length;

  const top = members[0];
  const topPerformer =
    top && top.leadCounts.total > 0
      ? { id: top.id, name: top.name, email: top.email, totalLeads: top.leadCounts.total }
      : null;

  return {
    summary: {
      totalMembers: members.length,
      adminCount,
      salesCount,
      totalLeads,
      topPerformer,
    },
    members,
  };
}
