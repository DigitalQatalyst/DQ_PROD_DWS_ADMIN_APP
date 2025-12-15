import React from 'react';
import ReactECharts from 'echarts-for-react';
import ChartContainer from './ChartContainer';
import ChartTheme from './ChartTheme';

export interface UptimeSuccessPoint {
  label: string; // e.g., Day 1, Day 2, or a date label
  uptime: number; // percent 0-100
  downtime: number; // percent 0-100 (usually 100 - uptime)
  successRate: number; // percent 0-100
}

export interface UptimeSuccessComboProps {
  data: UptimeSuccessPoint[];
  title?: string;
  description?: string;
  height?: string;
  className?: string;
}

const UptimeSuccessCombo: React.FC<UptimeSuccessComboProps> = ({
  data,
  title = 'System Uptime and Service Success Rate',
  description,
  height = 'h-96',
  className,
}) => {
  const labels = data.map(d => d.label);
  const uptime = data.map(d => d.uptime);
  const downtime = data.map(d => d.downtime);
  const success = data.map(d => d.successRate);

  const option = {
    ...ChartTheme.getEChartsOption(),
    title: { left: 'center' },
    tooltip: {
      ...ChartTheme.getEChartsOption().tooltip,
      trigger: 'axis',
      axisPointer: {
        type: 'cross',
        label: { backgroundColor: '#6a7985' },
      },
      formatter: (params: any[]) => {
        const lbl = params?.[0]?.axisValue || '';
        const u = params.find(p => p.seriesName === 'Uptime')?.value;
        const d = params.find(p => p.seriesName === 'Downtime')?.value;
        const s = params.find(p => p.seriesName === 'Success Rate')?.value;
        return `${lbl}<br/>Uptime: ${u}%<br/>Downtime: ${d}%<br/>Success Rate: ${s}%`;
      },
    },
    legend: {
      data: ['Uptime', 'Downtime', 'Success Rate'],
      bottom: 0,
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '15%',
      top: '10%',
      containLabel: true,
    },
    xAxis: [
      {
        type: 'category',
        data: labels,
        axisPointer: { type: 'shadow' },
        axisLabel: { color: ChartTheme.base.neutralGray },
      },
    ],
    yAxis: [
      {
        type: 'value',
        name: 'Uptime / Downtime (%)',
        min: 0,
        max: 100,
        axisLabel: { formatter: '{value}%', color: ChartTheme.base.neutralGray },
        splitLine: { show: false },
      },
      {
        type: 'value',
        name: 'Success Rate (%)',
        min: 0,
        max: 100,
        axisLabel: { formatter: '{value}%', color: ChartTheme.base.neutralGray },
        splitLine: { show: false },
      },
    ],
    series: [
      {
        name: 'Uptime',
        type: 'bar',
        stack: 'total',
        data: uptime,
        itemStyle: { color: '#00b300' },
        barMaxWidth: 28,
      },
      {
        name: 'Downtime',
        type: 'bar',
        stack: 'total',
        data: downtime,
        itemStyle: { color: '#ff4500' },
        barMaxWidth: 28,
      },
      {
        name: 'Success Rate',
        type: 'line',
        yAxisIndex: 1,
        data: success,
        itemStyle: { color: '#007bff' },
        smooth: true,
        symbol: 'circle',
        symbolSize: 6,
        lineStyle: { width: 3 },
      },
    ],
  };

  return (
    <ChartContainer title={title} description={description} height={height} className={className}>
      <ReactECharts option={option} style={{ height: '100%', width: '100%' }} />
    </ChartContainer>
  );
};

export default UptimeSuccessCombo;




