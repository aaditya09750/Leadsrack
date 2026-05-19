import { TrendingUp, TrendingDown } from 'lucide-react';
import { Card } from '../ui/Card';
import { cn } from '../../lib/utils';

const stats = [
  { title: 'Views', value: '721K', change: '+11.01%', trend: 'up', bgColor: 'bg-stat-views' },
  { title: 'Visits', value: '367K', change: '-0.03%', trend: 'down', bgColor: 'bg-stat-visits' },
  { title: 'New Users', value: '1,156', change: '+15.03%', trend: 'up', bgColor: 'bg-stat-newUsers' },
  { title: 'Active Users', value: '239K', change: '+6.08%', trend: 'up', bgColor: 'bg-stat-activeUsers' },
];

export const StatsGrid = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-7 px-7 py-7">
      {stats.map((stat, idx) => (
        <Card key={idx} className={cn("flex flex-col gap-2", stat.bgColor)}>
          <span className="text-background text-sm font-semibold">{stat.title}</span>
          <div className="flex items-center justify-between mt-1">
            <span className="text-background text-2xl font-bold">{stat.value}</span>
            <div className="flex items-center gap-1">
              <span className="text-background text-xs">{stat.change}</span>
              {stat.trend === 'up' ? (
                <TrendingUp size={14} className="text-background" />
              ) : (
                <TrendingDown size={14} className="text-background" />
              )}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};
