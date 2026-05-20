// Period resolution for the dashboard. Maps a string key (e.g. "month") to a
// concrete date range, an equal-length-or-calendar-aligned previous range for
// KPI deltas, and a bucket strategy used to bin leads on a time-series axis.
//
// All date math runs in the server's local time zone. For Render Oregon the
// off-by-a-few-hours risk is acceptable for v1; if multi-tz reporting becomes
// a requirement, accept a `tz` query param and use a tz-aware date lib.

export const PERIOD_KEYS = ['today', 'week', 'month', 'last30', 'year', 'all'] as const;
export type PeriodKey = (typeof PERIOD_KEYS)[number];

export type BucketKind =
  | 'hour4' // 'today': 6 buckets × 4h
  | 'dayOfWeek' // 'week': Mon..Sun (7 buckets)
  | 'weekOfMonth' // 'month': W1..W5 (5 buckets)
  | 'fiveDay' // 'last30': 6 buckets × 5 days
  | 'monthOfYear' // 'year': Jan..Dec (12 buckets)
  | 'last12Months'; // 'all': rolling last 12 months by name (12 buckets)

export interface PeriodRange {
  key: PeriodKey;
  from: Date;
  to: Date;
  previousFrom: Date;
  previousTo: Date;
  hasPrevious: boolean; // false for 'all' — no meaningful comparator
  bucket: BucketKind;
  bucketLabels: string[]; // axis labels, length === bucket count
}

export const PERIOD_LABELS: Record<PeriodKey, string> = {
  today: 'Today',
  week: 'This Week',
  month: 'This Month',
  last30: 'Last 30 Days',
  year: 'This Year',
  all: 'All Time',
};

const MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

const DAY_NAMES_MON_FIRST = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const DAY_MS = 24 * 60 * 60 * 1000;

function startOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1, 0, 0, 0, 0);
}

function startOfYear(d: Date): Date {
  return new Date(d.getFullYear(), 0, 1, 0, 0, 0, 0);
}

// Monday as week start (matches business convention; deliberate)
function startOfWeek(d: Date): Date {
  const day = d.getDay(); // 0=Sun..6=Sat
  const diff = (day + 6) % 7; // days since Monday
  const out = startOfDay(d);
  out.setDate(out.getDate() - diff);
  return out;
}

function shortDate(d: Date): string {
  return `${MONTH_NAMES[d.getMonth()]} ${d.getDate()}`;
}

export function resolvePeriod(key: PeriodKey, now: Date = new Date()): PeriodRange {
  switch (key) {
    case 'today': {
      const from = startOfDay(now);
      const to = now;
      const length = to.getTime() - from.getTime();
      const previousFrom = new Date(from.getTime() - DAY_MS);
      const previousTo = new Date(previousFrom.getTime() + length);
      return {
        key,
        from,
        to,
        previousFrom,
        previousTo,
        hasPrevious: true,
        bucket: 'hour4',
        bucketLabels: ['12am', '4am', '8am', '12pm', '4pm', '8pm'],
      };
    }
    case 'week': {
      const from = startOfWeek(now);
      const to = now;
      const previousFrom = new Date(from.getTime() - 7 * DAY_MS);
      const previousTo = from;
      return {
        key,
        from,
        to,
        previousFrom,
        previousTo,
        hasPrevious: true,
        bucket: 'dayOfWeek',
        bucketLabels: [...DAY_NAMES_MON_FIRST],
      };
    }
    case 'month': {
      const from = startOfMonth(now);
      const to = now;
      const previousFrom = new Date(from.getFullYear(), from.getMonth() - 1, 1);
      const previousTo = from;
      return {
        key,
        from,
        to,
        previousFrom,
        previousTo,
        hasPrevious: true,
        bucket: 'weekOfMonth',
        bucketLabels: ['W1', 'W2', 'W3', 'W4', 'W5'],
      };
    }
    case 'last30': {
      const to = now;
      const from = new Date(to.getTime() - 30 * DAY_MS);
      const previousTo = from;
      const previousFrom = new Date(previousTo.getTime() - 30 * DAY_MS);
      // Label each bucket by its start date (M/D)
      const labels: string[] = [];
      for (let i = 0; i < 6; i++) {
        labels.push(shortDate(new Date(from.getTime() + i * 5 * DAY_MS)));
      }
      return {
        key,
        from,
        to,
        previousFrom,
        previousTo,
        hasPrevious: true,
        bucket: 'fiveDay',
        bucketLabels: labels,
      };
    }
    case 'year': {
      const from = startOfYear(now);
      const to = now;
      const previousFrom = new Date(from.getFullYear() - 1, 0, 1);
      const previousTo = from;
      return {
        key,
        from,
        to,
        previousFrom,
        previousTo,
        hasPrevious: true,
        bucket: 'monthOfYear',
        bucketLabels: [...MONTH_NAMES],
      };
    }
    case 'all': {
      // 'All time' — no meaningful previous period. We still bucket by the
      // last 12 calendar months so the chart has shape.
      const to = now;
      const from = new Date(0); // 1970-01-01
      const labels: string[] = [];
      for (let i = 11; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        labels.push(MONTH_NAMES[d.getMonth()] ?? '');
      }
      return {
        key,
        from,
        to,
        previousFrom: new Date(0),
        previousTo: new Date(0),
        hasPrevious: false,
        bucket: 'last12Months',
        bucketLabels: labels,
      };
    }
    default: {
      const _exhaustive: never = key;
      throw new Error(`Unhandled period key: ${String(_exhaustive)}`);
    }
  }
}

// Given a lead's createdAt, return the bucket index 0..N-1 it belongs to for
// the given period range and which window (current vs previous). Returns -1 if
// the date is outside any defined bucket (shouldn't happen if the caller has
// already $match'd the date range, but defensive).
export function bucketIndex(
  date: Date,
  range: PeriodRange,
  which: 'current' | 'previous',
  now: Date = new Date(),
): number {
  switch (range.bucket) {
    case 'hour4':
      return Math.min(5, Math.max(0, Math.floor(date.getHours() / 4)));
    case 'dayOfWeek': {
      const day = date.getDay(); // 0=Sun..6=Sat
      return (day + 6) % 7; // Mon=0..Sun=6
    }
    case 'weekOfMonth':
      return Math.min(4, Math.max(0, Math.floor((date.getDate() - 1) / 7)));
    case 'fiveDay': {
      const base = which === 'current' ? range.from : range.previousFrom;
      const days = Math.floor((date.getTime() - base.getTime()) / DAY_MS);
      return Math.min(5, Math.max(0, Math.floor(days / 5)));
    }
    case 'monthOfYear':
      return date.getMonth();
    case 'last12Months': {
      const monthsDiff =
        (now.getFullYear() - date.getFullYear()) * 12 + (now.getMonth() - date.getMonth());
      const idx = 11 - monthsDiff;
      return idx >= 0 && idx <= 11 ? idx : -1;
    }
    default: {
      const _exhaustive: never = range.bucket;
      throw new Error(`Unhandled bucket kind: ${String(_exhaustive)}`);
    }
  }
}

// Produce the rolling-last-12-months axis labels + a Map<bucketIndex, monthStart>
// helper for the marketing-monthly widget. Always 12 buckets regardless of period.
export function last12MonthsAxis(now: Date = new Date()): { labels: string[]; starts: Date[] } {
  const labels: string[] = [];
  const starts: Date[] = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    starts.push(d);
    labels.push(MONTH_NAMES[d.getMonth()] ?? '');
  }
  return { labels, starts };
}

// Helper for the service: index into the 12-month rolling array.
export function last12MonthsBucket(date: Date, now: Date = new Date()): number {
  const monthsDiff =
    (now.getFullYear() - date.getFullYear()) * 12 + (now.getMonth() - date.getMonth());
  const idx = 11 - monthsDiff;
  return idx >= 0 && idx <= 11 ? idx : -1;
}
