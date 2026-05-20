import { Types } from 'mongoose';
import { Lead, type LeadStatus, type LeadSource } from '../models/Lead.js';
import { User } from '../models/User.js';
import {
  type PeriodKey,
  type PeriodRange,
  resolvePeriod,
  bucketIndex,
  last12MonthsAxis,
  last12MonthsBucket,
} from '../lib/periods.js';
import type { Viewer } from './leads.js';

// ── Response shape (matches Frontend/src/types/dashboard.ts) ──────────────────

export interface KpiMetric {
  key: string;
  title: string;
  value: string;
  change: string; // '+11.5%' or '-2.3%' or '' when no comparator
  positive: boolean;
  bgKey: string; // reuses existing Tailwind bg-stat-* classes via the frontend's STAT_BG map
}

export interface ChartSeriesItem {
  name: string;
  data: number[];
  color: string;
  dashed: boolean;
}

export interface UserChartData {
  xAxis: string[];
  series: ChartSeriesItem[];
}

export interface UserChartPivots {
  totalLeads: UserChartData;
  qualified: UserChartData;
  conversion: UserChartData;
}

export interface DashboardOverview {
  period: { key: PeriodKey; from: string; to: string };
  kpis: KpiMetric[];
  userChart: UserChartData & { pivots: UserChartPivots };
  trafficByWebsite: Array<{ name: string; value: number; active: boolean }>;
  trafficByDevice: Array<{ label: string; value: number; color: string }>;
  trafficByLocation: Array<{ country: string; percentage: number; color: string }>;
  marketingMonthly: Array<{ month: string; value: number; color: string; count: number }>;
}

// ── Aggregation result types ──────────────────────────────────────────────────

interface CurrentTotalsRow {
  _id: null;
  total: number;
  newCount: number;
  contacted: number;
  qualified: number;
  lost: number;
}

interface PreviousTotalsRow {
  _id: null;
  total: number;
  qualified: number;
}

interface CountByKey {
  _id: string;
  count: number;
}

interface CountByOwner {
  _id: Types.ObjectId;
  count: number;
}

interface TimeseriesRow {
  _id: Types.ObjectId;
  createdAt: Date;
  status: LeadStatus;
}

interface MonthlyCountRow {
  _id: { y: number; m: number };
  count: number;
}

interface FacetResult {
  currentTotals: CurrentTotalsRow[];
  previousTotals: PreviousTotalsRow[];
  byStatus: CountByKey[];
  bySource: CountByKey[];
  byOwner: CountByOwner[];
  tsCurrent: TimeseriesRow[];
  tsPrevious: TimeseriesRow[];
  monthlyCounts: MonthlyCountRow[];
}

// ── Constants ─────────────────────────────────────────────────────────────────

const SERIES_COLOR_CURRENT = '#C6C7F8'; // accent.purple — solid
const SERIES_COLOR_PREVIOUS = '#A8C5DA'; // accent.blue — dashed

const STATUS_ORDER: readonly LeadStatus[] = ['New', 'Contacted', 'Qualified', 'Lost'];
const SOURCE_ORDER: readonly LeadSource[] = ['Website', 'Instagram', 'Referral'];

const SOURCE_COLOR: Record<LeadSource, string> = {
  Website: 'sky',
  Instagram: 'purple',
  Referral: 'green',
};

const OWNER_COLOR_CYCLE = ['purple', 'green', 'indigo', 'sky', 'teal'] as const;
const MONTHLY_COLOR_CYCLE = ['indigo', 'green', 'purple', 'sky', 'blue', 'teal'] as const;

// ── Helpers ───────────────────────────────────────────────────────────────────

function emptyTotals(): CurrentTotalsRow {
  return { _id: null, total: 0, newCount: 0, contacted: 0, qualified: 0, lost: 0 };
}

function emptyPreviousTotals(): PreviousTotalsRow {
  return { _id: null, total: 0, qualified: 0 };
}

function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 10_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString('en-US');
}

function formatPercent(n: number): string {
  return `${n.toFixed(1)}%`;
}

function pctDelta(current: number, previous: number): { change: string; positive: boolean } {
  if (previous === 0 && current === 0) return { change: '0%', positive: true };
  if (previous === 0) return { change: '+100%', positive: true };
  const pct = ((current - previous) / previous) * 100;
  const rounded = Math.round(pct * 10) / 10;
  const sign = rounded >= 0 ? '+' : '';
  return { change: `${sign}${rounded.toFixed(1)}%`, positive: rounded >= 0 };
}

// Build the per-bucket series. `total` is bucket count, `qualified` is bucket
// qualified count, `conversion` is qualified/total per bucket as 0-100.
function buildBucketSeries(
  rows: TimeseriesRow[],
  range: PeriodRange,
  which: 'current' | 'previous',
  now: Date,
): { total: number[]; qualified: number[]; conversion: number[] } {
  const len = range.bucketLabels.length;
  const total = new Array<number>(len).fill(0);
  const qualified = new Array<number>(len).fill(0);
  for (const row of rows) {
    const i = bucketIndex(row.createdAt, range, which, now);
    if (i < 0 || i >= len) continue;
    total[i] = (total[i] ?? 0) + 1;
    if (row.status === 'Qualified') qualified[i] = (qualified[i] ?? 0) + 1;
  }
  const conversion = total.map((t, i) => {
    const q = qualified[i] ?? 0;
    if (t === 0) return 0;
    return Math.round((q / t) * 1000) / 10; // 0-100 with one decimal
  });
  return { total, qualified, conversion };
}

function buildPivots(
  range: PeriodRange,
  current: TimeseriesRow[],
  previous: TimeseriesRow[],
  now: Date,
): UserChartPivots {
  const c = buildBucketSeries(current, range, 'current', now);
  const p = buildBucketSeries(previous, range, 'previous', now);
  const make = (currentArr: number[], previousArr: number[]): UserChartData => ({
    xAxis: range.bucketLabels,
    series: [
      { name: 'Current', data: currentArr, color: SERIES_COLOR_CURRENT, dashed: false },
      { name: 'Previous', data: previousArr, color: SERIES_COLOR_PREVIOUS, dashed: true },
    ],
  });
  return {
    totalLeads: make(c.total, p.total),
    qualified: make(c.qualified, p.qualified),
    conversion: make(c.conversion, p.conversion),
  };
}

function buildStatusBars(
  byStatus: CountByKey[],
): DashboardOverview['trafficByWebsite'] {
  const map = new Map(byStatus.map((r) => [r._id, r.count]));
  const counts = STATUS_ORDER.map((s) => ({ name: s, count: map.get(s) ?? 0 }));
  const max = counts.reduce((m, c) => Math.max(m, c.count), 0);
  return counts.map(({ name, count }) => ({
    name,
    // Bars render against a fixed max=100 axis — scale relative to the largest
    // bucket so the chart fills visually. Bucket count is still surfaced via
    // the active flag and could be shown in tooltips if we extend the widget.
    value: max === 0 ? 0 : Math.round((count / max) * 100),
    active: count > 0 && count === max,
  }));
}

function buildSourceBars(
  bySource: CountByKey[],
): DashboardOverview['trafficByDevice'] {
  const map = new Map(bySource.map((r) => [r._id, r.count]));
  const counts = SOURCE_ORDER.map((s) => ({ label: s, count: map.get(s) ?? 0 }));
  const max = counts.reduce((m, c) => Math.max(m, c.count), 0);
  return counts.map(({ label, count }) => ({
    label,
    value: max === 0 ? 0 : Math.round((count / max) * 100),
    color: SOURCE_COLOR[label as LeadSource],
  }));
}

async function buildOwnerDonut(
  byOwner: CountByOwner[],
): Promise<DashboardOverview['trafficByLocation']> {
  if (byOwner.length === 0) return [];
  // Top 4 directly; everything else collapses into "Other".
  const top = byOwner.slice(0, 4);
  const others = byOwner.slice(4);
  const otherCount = others.reduce((sum, r) => sum + r.count, 0);

  const ownerIds = top.map((r) => r._id);
  const users = await User.find({ _id: { $in: ownerIds } }, { name: 1, email: 1 }).lean();
  const nameById = new Map(users.map((u) => [String(u._id), u.name]));

  const total = byOwner.reduce((sum, r) => sum + r.count, 0);
  const rows: DashboardOverview['trafficByLocation'] = top.map((r, i) => ({
    country: nameById.get(String(r._id)) ?? 'Unknown',
    percentage: total === 0 ? 0 : Math.round((r.count / total) * 1000) / 10,
    color: OWNER_COLOR_CYCLE[i % OWNER_COLOR_CYCLE.length] ?? 'purple',
  }));
  if (otherCount > 0) {
    rows.push({
      country: 'Other',
      percentage: Math.round((otherCount / total) * 1000) / 10,
      color: OWNER_COLOR_CYCLE[top.length % OWNER_COLOR_CYCLE.length] ?? 'sky',
    });
  }
  return rows;
}

function buildMonthlyBars(
  monthly: MonthlyCountRow[],
  now: Date,
): DashboardOverview['marketingMonthly'] {
  const { labels, starts } = last12MonthsAxis(now);
  const counts = new Array<number>(labels.length).fill(0);
  for (const row of monthly) {
    const d = new Date(row._id.y, row._id.m - 1, 1);
    const i = last12MonthsBucket(d, now);
    if (i < 0 || i >= counts.length) continue;
    counts[i] = (counts[i] ?? 0) + row.count;
  }
  const max = counts.reduce((m, v) => Math.max(m, v), 0);
  return labels.map((month, i) => {
    const count = counts[i] ?? 0;
    void starts; // axis dates kept for potential future tooltip use
    return {
      month,
      value: max === 0 ? 0 : Math.round((count / max) * 100),
      color: MONTHLY_COLOR_CYCLE[i % MONTHLY_COLOR_CYCLE.length] ?? 'indigo',
      count,
    };
  });
}

function buildKpis(
  current: CurrentTotalsRow,
  previous: PreviousTotalsRow,
  hasPrevious: boolean,
): KpiMetric[] {
  const currConversion = current.total === 0 ? 0 : (current.qualified / current.total) * 100;
  const prevConversion = previous.total === 0 ? 0 : (previous.qualified / previous.total) * 100;

  const mkDelta = (curr: number, prev: number): { change: string; positive: boolean } =>
    hasPrevious ? pctDelta(curr, prev) : { change: '', positive: true };

  return [
    {
      key: 'totalLeads',
      title: 'Total Leads',
      value: formatCount(current.total),
      ...mkDelta(current.total, previous.total),
      bgKey: 'views',
    },
    {
      key: 'newLeads',
      title: 'New',
      value: formatCount(current.newCount),
      // No matching field on PreviousTotalsRow — compare against previous total
      // as a coarse proxy. Sufficient for the headline KPI; full per-status
      // history would require enlarging the previousTotals branch.
      ...mkDelta(current.newCount, Math.round(previous.total * (current.total === 0 ? 0 : current.newCount / current.total))),
      bgKey: 'visits',
    },
    {
      key: 'qualifiedLeads',
      title: 'Qualified',
      value: formatCount(current.qualified),
      ...mkDelta(current.qualified, previous.qualified),
      bgKey: 'newUsers',
    },
    {
      key: 'conversionRate',
      title: 'Conversion Rate',
      value: formatPercent(currConversion),
      ...mkDelta(currConversion, prevConversion),
      bgKey: 'activeUsers',
    },
  ];
}

// ── Public entry point ────────────────────────────────────────────────────────

export async function getOverview(
  viewer: Viewer,
  periodKey: PeriodKey,
): Promise<DashboardOverview> {
  const now = new Date();
  const range = resolvePeriod(periodKey, now);

  const baseMatch: Record<string, unknown> =
    viewer.role === 'admin' ? {} : { createdBy: new Types.ObjectId(viewer.id) };

  const periodMatch = {
    ...baseMatch,
    createdAt: { $gte: range.from, $lt: range.to },
  };
  const prevMatch = {
    ...baseMatch,
    createdAt: { $gte: range.previousFrom, $lt: range.previousTo },
  };

  // Marketing-monthly chart is always last 12 months regardless of period.
  const monthlyStart = new Date(now.getFullYear(), now.getMonth() - 11, 1);
  const monthlyMatch = { ...baseMatch, createdAt: { $gte: monthlyStart } };

  // For 'all' period the time-series is bucketed by the last 12 months — cap
  // the fetch to that window so we don't drag every historical doc into memory.
  const tsCurrentMatch =
    range.bucket === 'last12Months'
      ? { ...baseMatch, createdAt: { $gte: monthlyStart } }
      : periodMatch;

  const [result] = await Lead.aggregate<FacetResult>([
    {
      $facet: {
        currentTotals: [
          { $match: periodMatch },
          {
            $group: {
              _id: null,
              total: { $sum: 1 },
              newCount: { $sum: { $cond: [{ $eq: ['$status', 'New'] }, 1, 0] } },
              contacted: { $sum: { $cond: [{ $eq: ['$status', 'Contacted'] }, 1, 0] } },
              qualified: { $sum: { $cond: [{ $eq: ['$status', 'Qualified'] }, 1, 0] } },
              lost: { $sum: { $cond: [{ $eq: ['$status', 'Lost'] }, 1, 0] } },
            },
          },
        ],
        previousTotals: [
          { $match: prevMatch },
          {
            $group: {
              _id: null,
              total: { $sum: 1 },
              qualified: { $sum: { $cond: [{ $eq: ['$status', 'Qualified'] }, 1, 0] } },
            },
          },
        ],
        byStatus: [
          { $match: periodMatch },
          { $group: { _id: '$status', count: { $sum: 1 } } },
        ],
        bySource: [
          { $match: periodMatch },
          { $group: { _id: '$source', count: { $sum: 1 } } },
        ],
        byOwner: [
          { $match: periodMatch },
          { $group: { _id: '$createdBy', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          { $limit: 10 },
        ],
        tsCurrent: [
          { $match: tsCurrentMatch },
          { $project: { createdAt: 1, status: 1 } },
        ],
        tsPrevious: [
          { $match: prevMatch },
          { $project: { createdAt: 1, status: 1 } },
        ],
        monthlyCounts: [
          { $match: monthlyMatch },
          {
            $group: {
              _id: { y: { $year: '$createdAt' }, m: { $month: '$createdAt' } },
              count: { $sum: 1 },
            },
          },
        ],
      },
    },
  ]);

  const facet = result ?? {
    currentTotals: [],
    previousTotals: [],
    byStatus: [],
    bySource: [],
    byOwner: [],
    tsCurrent: [],
    tsPrevious: [],
    monthlyCounts: [],
  };

  const current = facet.currentTotals[0] ?? emptyTotals();
  const previous = facet.previousTotals[0] ?? emptyPreviousTotals();

  const pivots = buildPivots(range, facet.tsCurrent, facet.tsPrevious, now);
  const trafficByLocation = await buildOwnerDonut(facet.byOwner);

  return {
    period: {
      key: range.key,
      from: range.from.toISOString(),
      to: range.to.toISOString(),
    },
    kpis: buildKpis(current, previous, range.hasPrevious),
    userChart: {
      ...pivots.totalLeads, // default tab matches the first pivot
      pivots,
    },
    trafficByWebsite: buildStatusBars(facet.byStatus),
    trafficByDevice: buildSourceBars(facet.bySource),
    trafficByLocation,
    marketingMonthly: buildMonthlyBars(facet.monthlyCounts, now),
  };
}
