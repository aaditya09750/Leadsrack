import ReactECharts from 'echarts-for-react';
import { BarChart3 } from 'lucide-react';
import { Card } from '../ui/Card';
import { ChartEmpty } from '../feedback/ChartEmpty';
import { accentHex } from '../../lib/colors';
import { useThemeStore } from '../../store/themeStore';
import { MARKETING_MONTHLY } from '../../data/dashboardData';
import { useDashboardOverview } from '../../features/dashboard/useDashboard';
import { usePeriodParam } from '../../features/dashboard/usePeriodParam';

export const MarketingMonthly = () => {
  const theme = useThemeStore((s) => s.theme);
  const isDark = theme === 'dark';
  const axisColor = isDark ? 'rgba(255, 255, 255, 0.5)' : 'rgba(28, 28, 28, 0.55)';

  const [period] = usePeriodParam();
  const { data } = useDashboardOverview(period);
  const rows = data?.marketingMonthly ?? MARKETING_MONTHLY;
  // Chart bars are normalized 0-100; presence of any real lead is signalled by count > 0
  // when the backend serves the response, OR a non-zero normalized value as a fallback.
  const hasData = rows.some((r) => (r.count ?? 0) > 0 || r.value > 0);
  const totalLeads = rows.reduce((sum, r) => sum + (r.count ?? 0), 0);

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
      formatter: (params: Array<{ name: string; dataIndex: number }>) => {
        const head = params[0];
        if (!head) return '';
        const labelColor = isDark ? 'rgba(255,255,255,0.4)' : 'rgba(28,28,28,0.6)';
        const count = rows[head.dataIndex]?.count ?? 0;
        const leadWord = count === 1 ? 'lead' : 'leads';
        return `<div style="font-family: Inter">
          <div style="font-size: 10px; color: ${labelColor}; margin-bottom: 4px">${head.name}</div>
          <div style="font-weight: 600">${count} ${leadWord}</div>
        </div>`;
      },
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
      <div className="flex items-baseline justify-between gap-3 mb-4">
        <h3 className="text-primary text-sm font-semibold">Leads Created per Month</h3>
        <span className="text-secondary text-[11px]">
          Last 12 months{totalLeads > 0 ? ` · ${totalLeads} total` : ''}
        </span>
      </div>
      <div className="flex-1">
        {hasData ? (
          <ReactECharts option={option} style={{ height: '100%', width: '100%' }} notMerge />
        ) : (
          <ChartEmpty
            icon={<BarChart3 size={32} strokeWidth={1.25} />}
            message="No leads created in the last 12 months."
            hint="Create your first lead to start populating the monthly trend."
          />
        )}
      </div>
    </Card>
  );
};
