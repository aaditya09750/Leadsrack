import ReactECharts from 'echarts-for-react';
import { Card } from '../ui/Card';
import { useThemeStore } from '../../store/themeStore';
import { USER_CHART } from '../../data/dashboardData';
import { useDashboardOverview } from '../../features/dashboard/useDashboard';

export const UserChart = () => {
  const theme = useThemeStore((s) => s.theme);
  const isDark = theme === 'dark';

  const { data } = useDashboardOverview();
  const chart = data?.userChart ?? USER_CHART;

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
      formatter: (params: Array<{ name: string; value: number }>) => {
        const head = params[0];
        if (!head) return '';
        const labelColor = isDark ? 'rgba(255,255,255,0.4)' : 'rgba(28,28,28,0.6)';
        return `<div style="font-family: Inter">
          <div style="font-size: 10px; color: ${labelColor}; margin-bottom: 4px">${head.name}</div>
          <div style="font-weight: 700">${head.value.toLocaleString()}</div>
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
      axisLabel: { color: axisColor, fontSize: 12, formatter: '{value}M' },
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
    <Card className="bg-surface h-[340px] flex flex-col">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-6">
          <button className="text-primary text-sm font-semibold border-b-2 border-primary pb-1">
            Total Users
          </button>
          <button className="text-secondary text-sm hover:text-primary transition-colors pb-1">
            Total Projects
          </button>
          <button className="text-secondary text-sm hover:text-primary transition-colors pb-1">
            Operating Status
          </button>
        </div>
        <div className="flex items-center gap-6">
          {legend.map((l) => (
            <div key={l.name} className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: l.color }} />
              <span className="text-primary text-[11px]">{l.name}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="flex-1">
        <ReactECharts option={option} style={{ height: '100%', width: '100%' }} notMerge />
      </div>
    </Card>
  );
};
