import { useState } from 'react';
import ReactECharts from 'echarts-for-react';
import { LineChart } from 'lucide-react';
import { Card } from '../ui/Card';
import { ChartEmpty } from '../feedback/ChartEmpty';
import { cn } from '../../lib/utils';
import { useThemeStore } from '../../store/themeStore';
import { USER_CHART } from '../../data/dashboardData';
import { useDashboardOverview } from '../../features/dashboard/useDashboard';
import { usePeriodParam } from '../../features/dashboard/usePeriodParam';
import {
  USER_CHART_PIVOT_KEYS,
  USER_CHART_PIVOT_LABELS,
  PERIOD_LABELS,
  type UserChartPivotKey,
} from '../../types/dashboard';

export const UserChart = () => {
  const theme = useThemeStore((s) => s.theme);
  const isDark = theme === 'dark';
  const [activeTab, setActiveTab] = useState<UserChartPivotKey>('totalLeads');

  const [period] = usePeriodParam();
  const { data } = useDashboardOverview(period);
  const pivots = data?.userChart.pivots ?? USER_CHART.pivots;
  const chart = pivots[activeTab];
  const isConversion = activeTab === 'conversion';
  const hasData =
    chart.xAxis.length > 0 && chart.series.some((s) => s.data.some((v) => v > 0));

  const axisColor = isDark ? 'rgba(255, 255, 255, 0.4)' : 'rgba(28, 28, 28, 0.55)';
  const splitColor = isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(28, 28, 28, 0.06)';

  const option = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      backgroundColor: isDark ? 'rgba(28, 28, 28, 0.92)' : 'rgba(255, 255, 255, 0.96)',
      borderColor: isDark ? 'rgba(255, 255, 255, 0.10)' : 'rgba(28, 28, 28, 0.10)',
      textStyle: {
        color: isDark ? '#FFFFFF' : '#1C1C1C',
        fontSize: 12,
        fontFamily: 'Inter',
      },
      padding: [8, 12],
      borderRadius: 8,
      formatter: (params: Array<{ name: string; value: number; seriesName: string }>) => {
        if (params.length === 0) return '';
        const labelColor = isDark ? 'rgba(255,255,255,0.4)' : 'rgba(28,28,28,0.6)';
        const fmt = (v: number) =>
          isConversion ? `${v.toFixed(1)}%` : v.toLocaleString();
        const rows = params
          .map(
            (p) =>
              `<div style="display:flex;justify-content:space-between;gap:12px"><span style="color:${labelColor}">${p.seriesName}</span><span style="font-weight:600">${fmt(p.value)}</span></div>`,
          )
          .join('');
        return `<div style="font-family: Inter">
          <div style="font-size: 10px; color: ${labelColor}; margin-bottom: 4px">${params[0]?.name ?? ''}</div>
          ${rows}
        </div>`;
      },
    },
    grid: { left: '0%', right: '2%', bottom: '0%', top: '10%', containLabel: true },
    xAxis: {
      type: 'category',
      data: chart.xAxis,
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: axisColor, fontSize: 12, margin: 20 },
    },
    yAxis: {
      type: 'value',
      axisLine: { show: false },
      axisTick: { show: false },
      splitLine: { lineStyle: { color: splitColor } },
      axisLabel: {
        color: axisColor,
        fontSize: 12,
        formatter: isConversion ? '{value}%' : '{value}',
      },
    },
    series: chart.series.map((s) => ({
      name: s.name,
      data: s.data,
      type: 'line',
      smooth: true,
      symbol: s.dashed ? 'none' : 'circle',
      symbolSize: 8,
      itemStyle: s.dashed
        ? undefined
        : {
            color: s.color,
            borderWidth: 2,
            borderColor: isDark ? '#FFFFFF' : '#1C1C1C',
          },
      lineStyle: s.dashed
        ? { width: 2, type: 'dashed', color: `${s.color}80` }
        : { width: 3, color: s.color },
      areaStyle: s.dashed
        ? undefined
        : {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: `${s.color}26` },
                { offset: 1, color: `${s.color}00` },
              ],
            },
          },
    })),
  };

  const legend = chart.series.map((s) => ({ name: s.name, color: s.color }));

  return (
    <Card className="bg-surface md:h-[340px] flex flex-col">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between xl:gap-4 mb-5 xl:mb-8">
        <div className="flex items-center gap-5 xl:gap-6 overflow-x-auto scrollbar-hidden -mx-4 px-4 sm:mx-0 sm:px-0 sm:overflow-visible">
          {USER_CHART_PIVOT_KEYS.map((key) => {
            const isActive = activeTab === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => setActiveTab(key)}
                className={cn(
                  'shrink-0 whitespace-nowrap text-sm pb-1 border-b-2 transition-colors',
                  isActive
                    ? 'text-primary font-semibold border-primary'
                    : 'text-secondary border-transparent hover:text-primary',
                )}
              >
                {USER_CHART_PIVOT_LABELS[key]}
              </button>
            );
          })}
        </div>
        <div className="flex items-center gap-4 sm:gap-6">
          {legend.map((l) => (
            <div key={l.name} className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: l.color }} />
              <span className="text-primary text-[11px] whitespace-nowrap">{l.name}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="h-[220px] md:h-auto md:flex-1">
        {hasData ? (
          <ReactECharts option={option} style={{ height: '100%', width: '100%' }} notMerge />
        ) : (
          <ChartEmpty
            icon={<LineChart size={32} strokeWidth={1.25} />}
            message={`No ${USER_CHART_PIVOT_LABELS[activeTab].toLowerCase()} data for ${PERIOD_LABELS[period]}.`}
            hint="Try a wider period or add a new lead to see the trend."
          />
        )}
      </div>
    </Card>
  );
};
