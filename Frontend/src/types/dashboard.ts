export interface NavItem {
  id: string;
  label: string;
  icon?: string;
  badge?: string;
  children?: NavItem[];
}

export interface StatCardProps {
  title: string;
  value: string;
  change: string;
  trend: 'up' | 'down';
  bgColor: string;
}

export interface ActivityItem {
  id: string;
  user: {
    name: string;
    avatar: string;
  };
  action: string;
  time: string;
}

export interface NotificationItem {
  id: string;
  icon: React.ReactNode;
  message: string;
  time: string;
  bgColor: string;
}
