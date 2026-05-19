import React from 'react';
import ReactECharts from 'echarts-for-react';
import { Card } from '../ui/Card';

export const UserChart = () => {
  const option = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(28, 28, 28, 0.9)',
      borderColor: 'rgba(255, 255, 255, 0.1)',
      textStyle: { color: '#FFFFFF', fontSize: 12, fontFamily: 'Inter' },
      padding: [8, 12],
      borderRadius: 8,
      formatter: (params: any) => {
        return `<div class="font-sans">
          <div class="text-[10px] text-secondary mb-1">${params[0].name}</div>
          <div class="font-bold">${params[0].value.toLocaleString()}</div>
        </div>`;
      }
    },
    grid: {
      left: '0%',
      right: '2%',
      bottom: '0%',
      top: '10%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: 'rgba(255, 255, 255, 0.4)', fontSize: 12, margin: 20 }
    },
    yAxis: {
      type: 'value',
      axisLine: { show: false },
      axisTick: { show: false },
      splitLine: { lineStyle: { color: 'rgba(255, 255, 255, 0.05)' } },
      axisLabel: { color: 'rgba(255, 255, 255, 0.4)', fontSize: 12, formatter: '{value}M' }
    },
    series: [
      {
        name: 'Current Week',
        data: [12, 18, 14, 22, 16, 24, 20],
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 8,
        itemStyle: { color: '#C6C7F8', borderWidth: 2, borderColor: '#FFFFFF' },
        lineStyle: { width: 3, color: '#C6C7F8' },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(198, 199, 248, 0.15)' },
              { offset: 1, color: 'rgba(198, 199, 248, 0)' }
            ]
          }
        }
      },
      {
        name: 'Previous Week',
        data: [8, 12, 10, 15, 12, 18, 14],
        type: 'line',
        smooth: true,
        symbol: 'none',
        lineStyle: { width: 2, type: 'dashed', color: 'rgba(168, 197, 218, 0.5)' },
      }
    ]
  };

  return (
    <Card className="bg-white/5 h-[340px] flex flex-col">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-6">
          <button className="text-primary text-sm font-semibold border-b-2 border-primary pb-1">Total Users</button>
          <button className="text-secondary text-sm hover:text-primary transition-colors pb-1">Total Projects</button>
          <button className="text-secondary text-sm hover:text-primary transition-colors pb-1">Operating Status</button>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-accent-purple" />
            <span className="text-primary text-[11px]">Current Week</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-accent-blue" />
            <span className="text-primary text-[11px]">Previous Week</span>
          </div>
        </div>
      </div>
      <div className="flex-1">
        <ReactECharts option={option} style={{ height: '100%', width: '100%' }} />
      </div>
    </Card>
  );
};
