import React from 'react';
import ReactECharts from 'echarts-for-react';
import ChartContainer from './ChartContainer';
import ChartTheme from './ChartTheme';

export interface CSATPoint {
  period: string; // e.g., week or month label
  csatPct: number; // percentage 0-100
  responses: number;
}

export interface CSATTrendProps {
  data: CSATPoint[];
  csatTarget?: number; // target percentage
  csatBandLow?: number;
  csatBandHigh?: number;
  title?: string;
  description?: string;
  height?: string;
  className?: string;
}

const CSATTrend: React.FC<CSATTrendProps> = ({
  data,
  csatTarget = 90,
  csatBandLow = 85,
  csatBandHigh = 95,
  title = 'Customer Support Satisfaction (CSAT)',
  description = 'Stacked bar chart showing CSAT percentage and response volume by week',
  height = 'h-80',
  className,
}) => {
  const periods = data.map(d => d.period);
  const csatPct = data.map(d => d.csatPct);
  const responses = data.map(d => d.responses);

  const option = {
    ...ChartTheme.getEChartsOption(),
    tooltip: {
      ...ChartTheme.getEChartsOption().tooltip,
      trigger: 'axis',
      formatter: (params: any[]) => {
        const week = params[0]?.name || '';
        const csatParam = params.find((p: any) => p.seriesName === 'CSAT (%)');
        const volumeParam = params.find((p: any) => p.seriesName === 'Response Volume');
        const csat = csatParam?.value || 0;
        const volume = volumeParam?.value || 0;
        return `${week}<br/>CSAT: <b>${csat}%</b><br/>Volume: <b>${volume.toLocaleString()} responses</b>`;
      },
    },
    legend: {
      orient: 'vertical',
      right: 10,
      top: 'middle',
      itemWidth: 12,
      itemHeight: 12,
      itemGap: 12,
      textStyle: {
        color: ChartTheme.base.neutralGray,
      },
    },
    grid: { left: 60, right: 120, top: 30, bottom: 50 },
    xAxis: {
      type: 'category',
      data: periods,
      axisTick: { show: false },
      axisLabel: { rotate: 45 },
    },
    yAxis: {
      type: 'value',
      name: '',
      axisLabel: {
        formatter: '{value}',
      },
      splitLine: {
        show: true,
        lineStyle: { type: 'dashed' },
      },
    },
    series: [
      {
        name: 'CSAT (%)',
        type: 'bar',
        stack: 'metrics',
        data: csatPct,
        itemStyle: {
          color: '#66BB6A', // Green for CSAT
        },
        label: {
          show: true,
          position: 'top',
          formatter: '{c}%',
          color: ChartTheme.base.foreground,
          fontWeight: 600,
        },
      },
      {
        name: 'Response Volume',
        type: 'bar',
        stack: 'metrics',
        data: responses,
        itemStyle: {
          color: '#42A5F5', // Light blue for response volume
        },
        label: {
          show: true,
          position: 'top',
          formatter: '{c}',
          color: ChartTheme.base.foreground,
          fontWeight: 600,
        },
      },
    ],
  } as any;

  return (
    <ChartContainer title={title} description={description} height={height} className={className}>
      <ReactECharts option={option} style={{ height: '100%', width: '100%' }} />
    </ChartContainer>
  );
};

export default CSATTrend;
