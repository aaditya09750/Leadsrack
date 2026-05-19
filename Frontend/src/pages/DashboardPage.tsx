import { ChevronDown } from 'lucide-react';
import { cn } from '../lib/utils';
import { StatsGrid } from '../components/dashboard/StatsGrid';
import { UserChart } from '../components/dashboard/UserChart';
import { TrafficByWebsite } from '../components/dashboard/TrafficByWebsite';

const DEVICE_DATA = [
  { label: 'Linux', val: 40, color: 'bg-accent-indigo' },
  { label: 'Mac', val: 65, color: 'bg-accent-green' },
  { label: 'iOS', val: 50, color: 'bg-accent-purple' },
  { label: 'Windows', val: 85, color: 'bg-accent-sky' },
  { label: 'Android', val: 30, color: 'bg-accent-blue' },
  { label: 'Other', val: 65, color: 'bg-accent-teal' },
] as const;

const LOCATION_DATA = [
  { label: 'United States', val: '38.6%', color: 'bg-accent-purple' },
  { label: 'Canada', val: '22.5%', color: 'bg-accent-green' },
  { label: 'Mexico', val: '30.8%', color: 'bg-accent-indigo' },
  { label: 'Other', val: '8.1%', color: 'bg-accent-sky' },
] as const;

const MARKETING_DATA = [
  { label: 'Jan', val: 40, color: 'bg-accent-indigo' },
  { label: 'Feb', val: 65, color: 'bg-accent-green' },
  { label: 'Mar', val: 50, color: 'bg-accent-purple' },
  { label: 'Apr', val: 85, color: 'bg-accent-sky' },
  { label: 'May', val: 30, color: 'bg-accent-blue' },
  { label: 'Jun', val: 65, color: 'bg-accent-teal' },
  { label: 'Jul', val: 40, color: 'bg-accent-indigo' },
  { label: 'Aug', val: 65, color: 'bg-accent-green' },
  { label: 'Sep', val: 50, color: 'bg-accent-purple' },
  { label: 'Oct', val: 85, color: 'bg-accent-sky' },
  { label: 'Nov', val: 30, color: 'bg-accent-blue' },
  { label: 'Dec', val: 65, color: 'bg-accent-teal' },
] as const;

export const DashboardPage = () => {
  return (
    <>
      <div className="px-7 pt-7 pb-4 flex items-center justify-between">
        <button
          type="button"
          className="flex items-center gap-1 text-primary text-sm font-semibold hover:bg-white/5 px-2 py-1 rounded-lg transition-colors"
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
        <div className="bg-white/5 rounded-xl p-6 h-[340px] flex flex-col">
          <h3 className="text-primary text-sm font-semibold mb-8">Traffic by Device</h3>
          <div className="flex-1 flex items-end justify-between px-4 pb-2">
            {DEVICE_DATA.map((item) => (
              <div key={item.label} className="flex flex-col items-center gap-3 w-10">
                <div
                  className={cn('w-full rounded-t-sm transition-all duration-500', item.color)}
                  style={{ height: `${item.val}%` }}
                />
                <span className="text-secondary text-[10px] uppercase tracking-wider">
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white/5 rounded-xl p-6 h-[340px] flex flex-col">
          <h3 className="text-primary text-sm font-semibold mb-8">Traffic by Location</h3>
          <div className="flex-1 flex items-center justify-around">
            <div className="relative w-40 h-40">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  stroke="currentColor"
                  strokeWidth="12"
                  fill="transparent"
                  className="text-accent-purple"
                  strokeDasharray="251.2"
                  strokeDashoffset="60"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  stroke="currentColor"
                  strokeWidth="12"
                  fill="transparent"
                  className="text-accent-indigo"
                  strokeDasharray="251.2"
                  strokeDashoffset="140"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  stroke="currentColor"
                  strokeWidth="12"
                  fill="transparent"
                  className="text-accent-sky"
                  strokeDasharray="251.2"
                  strokeDashoffset="210"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  stroke="currentColor"
                  strokeWidth="12"
                  fill="transparent"
                  className="text-accent-green"
                  strokeDasharray="251.2"
                  strokeDashoffset="230"
                />
              </svg>
            </div>
            <div className="space-y-4">
              {LOCATION_DATA.map((item) => (
                <div key={item.label} className="flex items-center gap-12">
                  <div className="flex items-center gap-2">
                    <div className={cn('w-1.5 h-1.5 rounded-full', item.color)} />
                    <span className="text-primary text-xs">{item.label}</span>
                  </div>
                  <span className="text-primary text-xs font-medium ml-auto">{item.val}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="px-7">
        <div className="bg-white/5 rounded-xl p-6 h-[340px] flex flex-col">
          <h3 className="text-primary text-sm font-semibold mb-8">Marketing & SEO</h3>
          <div className="flex-1 flex items-end justify-between px-4 pb-2">
            {MARKETING_DATA.map((item, i) => (
              <div key={`${item.label}-${i}`} className="flex flex-col items-center gap-3 flex-1 px-1">
                <div
                  className={cn('w-full rounded-t-sm transition-all duration-500', item.color)}
                  style={{ height: `${item.val}%` }}
                />
                <span className="text-secondary text-[10px] uppercase tracking-wider">
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};
