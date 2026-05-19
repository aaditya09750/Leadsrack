// Mirrors Backend's /api/dashboard, /api/notifications, /api/activities, /api/contacts
// response shapes. Hand-maintained — kept in sync with Backend Mongoose models.

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
}

export interface DashboardOverview {
  kpis: KpiMetric[];
  userChart: UserChartData;
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
