import ReactECharts from 'echarts-for-react';
import { Tags } from 'lucide-react';
import { Card } from '../ui/Card';
import { ChartEmpty } from '../feedback/ChartEmpty';
import { accentHex } from '../../lib/colors';
import { useThemeStore } from '../../store/themeStore';
import { TRAFFIC_BY_DEVICE } from '../../data/dashboardData';
import { useDashboardOverview } from '../../features/dashboard/useDashboard';
import { usePeriodParam } from '../../features/dashboard/usePeriodParam';
import { PERIOD_LABELS } from '../../types/dashboard';

export const TrafficByDevice = () => {
  const theme = useThemeStore((s) => s.theme);
  const isDark = theme === 'dark';
  const axisColor = isDark ? 'rgba(255, 255, 255, 0.5)' : 'rgba(28, 28, 28, 0.55)';

  const [period] = usePeriodParam();
  const { data } = useDashboardOverview(period);
  const rows = data?.trafficByDevice ?? TRAFFIC_BY_DEVICE;
  const hasData = rows.some((r) => r.value > 0);

  const option = {
    backgroundColor: 'transparent',
    grid: { left: 8, right: 8, top: 10, bottom: 32, containLabel: false },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      backgroundColor: isDark ? 'rgba(28, 28, 28, 0.92)' : 'rgba(255, 255, 255, 0.96)',
      borderColor: isDark ? 'rgba(255, 255, 255, 0.10)' : 'rgba(28, 28, 28, 0.10)',
      textStyle: {
        color: isDark ? '#FFFFFF' : '#1C1C1C',
        fontSize: 12,
        fontFamily: 'Inter',
      },
      padding: [8, 12],
      borderRadius: 8,
    },
    xAxis: {
      type: 'category',
      data: rows.map((r) => r.label),
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: {
        color: axisColor,
        fontSize: 10,
        fontFamily: 'Inter',
        margin: 12,
        formatter: (v: string) => v.toUpperCase(),
      },
    },
    yAxis: {
      type: 'value',
      max: 100,
      show: false,
    },
    series: [
      {
        type: 'bar',
        barWidth: '55%',
        data: rows.map((r) => ({
          value: r.value,
          itemStyle: { color: accentHex(r.color), borderRadius: [6, 6, 0, 0] },
        })),
      },
    ],
  };

  return (
    <Card className="bg-surface h-[340px] flex flex-col">
      <h3 className="text-primary text-sm font-semibold mb-4">Leads by Source</h3>
      <div className="flex-1">
        {hasData ? (
          <ReactECharts option={option} style={{ height: '100%', width: '100%' }} notMerge />
        ) : (
          <ChartEmpty
            icon={<Tags size={32} strokeWidth={1.25} />}
            message={`No leads from any source for ${PERIOD_LABELS[period]}.`}
            hint="Capture leads from Website, Instagram, or Referral to see the source mix."
          />
        )}
      </div>
    </Card>
  );
};
