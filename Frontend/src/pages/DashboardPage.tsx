import { ChevronDown } from 'lucide-react';
import { StatsGrid } from '../components/dashboard/StatsGrid';
import { UserChart } from '../components/dashboard/UserChart';
import { TrafficByWebsite } from '../components/dashboard/TrafficByWebsite';
import { TrafficByDevice } from '../components/dashboard/TrafficByDevice';
import { TrafficByLocation } from '../components/dashboard/TrafficByLocation';
import { MarketingMonthly } from '../components/dashboard/MarketingMonthly';

export const DashboardPage = () => {
  return (
    <>
      <div className="px-7 pt-7 pb-4 flex items-center justify-between">
        <button
          type="button"
          className="flex items-center gap-1 text-primary text-sm font-semibold hover:bg-primary/5 px-2 py-1 rounded-lg transition-colors"
        >
          Today
          <ChevronDown size={16} className="text-secondary" />
        </button>
      </div>

      <StatsGrid />

      <div className="px-7 grid grid-cols-1 lg:grid-cols-3 gap-7 mb-7">
        <div className="lg:col-span-2">
          <UserChart />
        </div>
        <div className="lg:col-span-1">
          <TrafficByWebsite />
        </div>
      </div>

      <div className="px-7 grid grid-cols-1 lg:grid-cols-2 gap-7 mb-7">
        <TrafficByDevice />
        <TrafficByLocation />
      </div>

      <div className="px-7">
        <MarketingMonthly />
      </div>
    </>
  );
};
