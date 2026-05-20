import { StatsGrid } from '../components/dashboard/StatsGrid';
import { UserChart } from '../components/dashboard/UserChart';
import { TrafficByWebsite } from '../components/dashboard/TrafficByWebsite';
import { TrafficByDevice } from '../components/dashboard/TrafficByDevice';
import { TrafficByLocation } from '../components/dashboard/TrafficByLocation';
import { MarketingMonthly } from '../components/dashboard/MarketingMonthly';
import { PeriodFilter } from '../features/dashboard/PeriodFilter';

export const DashboardPage = () => {
  return (
    <>
      <div className="px-4 md:px-7 pt-5 md:pt-7 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <h1 className="font-display text-primary text-lg md:text-2xl font-semibold leading-tight">
          Leadsrack Smart Leads System
        </h1>
        <PeriodFilter />
      </div>

      <StatsGrid />

      <div className="px-4 md:px-7 grid grid-cols-1 lg:grid-cols-3 gap-5 md:gap-7 mb-5 md:mb-7">
        <div className="lg:col-span-2">
          <UserChart />
        </div>
        <div className="lg:col-span-1">
          <TrafficByWebsite />
        </div>
      </div>

      <div className="px-4 md:px-7 grid grid-cols-1 lg:grid-cols-2 gap-5 md:gap-7 mb-5 md:mb-7">
        <TrafficByDevice />
        <TrafficByLocation />
      </div>

      <div className="px-4 md:px-7">
        <MarketingMonthly />
      </div>
    </>
  );
};
