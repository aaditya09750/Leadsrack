// Mirrors Backend's /api/dashboard, /api/notifications, /api/activities, /api/contacts
// response shapes. Hand-maintained — kept in sync with Backend services.

export const PERIOD_KEYS = ['today', 'week', 'month', 'last30', 'year', 'all'] as const;
export type PeriodKey = (typeof PERIOD_KEYS)[number];

export const PERIOD_LABELS: Record<PeriodKey, string> = {
  today: 'Today',
  week: 'This Week',
  month: 'This Month',
  last30: 'Last 30 Days',
  year: 'This Year',
  all: 'All Time',
};

export const USER_CHART_PIVOT_KEYS = ['totalLeads', 'qualified', 'conversion'] as const;
export type UserChartPivotKey = (typeof USER_CHART_PIVOT_KEYS)[number];

export const USER_CHART_PIVOT_LABELS: Record<UserChartPivotKey, string> = {
  totalLeads: 'Total Leads',
  qualified: 'Qualified',
  conversion: 'Conversion %',
};

export interface KpiMetric {
  key: string;
  title: string;
  value: string;
  change: string;
  positive: boolean;
  bgKey: string;
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

export type UserChartPivots = Record<UserChartPivotKey, UserChartData>;

export interface TrafficWebsiteRow {
  name: string;
  value: number;
  active: boolean;
}

export interface TrafficDeviceRow {
  label: string;
  value: number;
  color: string;
}

export interface TrafficLocationRow {
  country: string;
  percentage: number;
  color: string;
}

export interface TrafficMarketingRow {
  month: string;
  value: number;
  color: string;
  count?: number;
}

export interface DashboardOverview {
  period: { key: PeriodKey; from: string; to: string };
  kpis: KpiMetric[];
  userChart: UserChartData & { pivots: UserChartPivots };
  trafficByWebsite: TrafficWebsiteRow[];
  trafficByDevice: TrafficDeviceRow[];
  trafficByLocation: TrafficLocationRow[];
  marketingMonthly: TrafficMarketingRow[];
}

export type NotificationAudience = 'admin' | 'sales' | 'all';

export interface NotificationDoc {
  id: string;
  kind: string;
  message: string;
  audience: NotificationAudience;
  createdAt: string;
}

export interface ActivityDoc {
  id: string;
  actorName: string;
  actorEmail: string;
  actorRole: 'admin' | 'sales' | null;
  action: string;
  createdAt: string;
}

export interface ContactDoc {
  id: string;
  name: string;
  email?: string;
  avatar?: string;
  linkedUserRole: 'admin' | 'sales' | null;
}
