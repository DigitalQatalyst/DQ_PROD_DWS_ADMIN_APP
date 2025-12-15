import React from 'react';
import ReactECharts from 'echarts-for-react';
import ChartContainer from './ChartContainer';
import ChartTheme from './ChartTheme';

export interface TicketsPoint {
  month: string;
  volume: number;
  resolved: number;
}

export interface TicketsStackedBarProps {
  data: TicketsPoint[];
  title?: string;
  description?: string;
  height?: string;
  className?: string;
}

const TicketsStackedBar: React.FC<TicketsStackedBarProps> = ({
  data,
  title = 'Support Ticket Volume and Resolution Time',
  description,
  height = 'h-80',
  className,
}) => {
  const months = data.map(d => d.month);
  const volume = data.map(d => d.volume);
  const resolved = data.map(d => d.resolved);

  const option = {
    ...ChartTheme.getEChartsOption(),
    tooltip: {
      ...ChartTheme.getEChartsOption().tooltip,
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      formatter: (params: any[]) => {
        const m = params?.[0]?.axisValue || '';
        const vol = params.find(p => p.seriesName === 'Ticket Volume')?.value;
        const res = params.find(p => p.seriesName === 'Resolved')?.value;
        return `${m}<br/>Ticket Volume: ${vol}<br/>Resolved: ${res}`;
      },
    },
    legend: {
      data: ['Ticket Volume', 'Resolved'],
      bottom: 0,
    },
    xAxis: {
      type: 'category',
      data: months,
      axisLabel: { color: ChartTheme.base.neutralGray },
    },
    yAxis: {
      type: 'value',
      axisLabel: { formatter: '{value} tickets', color: ChartTheme.base.neutralGray },
      splitLine: { show: false },
    },
    series: [
      {
        name: 'Ticket Volume',
        type: 'bar',
        stack: 'total',
        data: volume,
        itemStyle: { color: ChartTheme.base.primaryBlue },
        barMaxWidth: 28,
      },
      {
        name: 'Resolved',
        type: 'bar',
        stack: 'total',
        data: resolved,
        itemStyle: { color: ChartTheme.performance.good },
        barMaxWidth: 28,
      },
    ],
    grid: {
      left: '3%',
      right: '4%',
      bottom: '15%',
      top: '10%',
      containLabel: true,
    },
  };

  return (
    <ChartContainer title={title} description={description} height={height} className={className}>
      <ReactECharts option={option} style={{ height: '100%', width: '100%' }} />
    </ChartContainer>
  );
};

export default TicketsStackedBar;




