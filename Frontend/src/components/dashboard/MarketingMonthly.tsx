import ReactECharts from 'echarts-for-react';
import { Card } from '../ui/Card';
import { accentHex } from '../../lib/colors';
import { useThemeStore } from '../../store/themeStore';
import { MARKETING_MONTHLY } from '../../data/dashboardData';
import { useDashboardOverview } from '../../features/dashboard/useDashboard';

export const MarketingMonthly = () => {
  const theme = useThemeStore((s) => s.theme);
  const isDark = theme === 'dark';
  const axisColor = isDark ? 'rgba(255, 255, 255, 0.5)' : 'rgba(28, 28, 28, 0.55)';

  const { data } = useDashboardOverview();
  const rows = data?.marketingMonthly ?? MARKETING_MONTHLY;

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
      data: rows.map((r) => r.month),
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
        barWidth: '60%',
        data: rows.map((r) => ({
          value: r.value,
          itemStyle: { color: accentHex(r.color), borderRadius: [4, 4, 0, 0] },
        })),
      },
    ],
  };

  return (
    <Card className="bg-surface h-[340px] flex flex-col">
      <h3 className="text-primary text-sm font-semibold mb-4">Marketing &amp; SEO</h3>
      <div className="flex-1">
        <ReactECharts option={option} style={{ height: '100%', width: '100%' }} notMerge />
      </div>
    </Card>
  );
};
