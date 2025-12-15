import React from 'react';
import ReactECharts from 'echarts-for-react';
import ChartContainer from './ChartContainer';
import ChartTheme from './ChartTheme';

export type ServiceKey = 'Financial' | 'Non-Financial' | 'Advisory' | 'Training';

export interface DeliveryVolumeRow {
  period: string; // e.g., '2025-10-01' or '2025-W40' or '2025-10'
  avgDays: number; // Average Service Delivery Time for that period
  volumes: Record<ServiceKey, number>; // Requests processed per service type
}

export interface DeliveryTimeVsVolumeProps {
  data: DeliveryVolumeRow[]; // sorted by period ascending
  serviceOrder?: ServiceKey[]; // optional custom order for stacked bars
  slaDays?: number; // draw dashed markLine at this target (e.g., 3)
  showMovingAverage?: boolean; // default true
  movingAverageWindow?: number; // default 7
  title?: string;
  description?: string;
  height?: string;
  className?: string;
}

const DeliveryTimeVsVolume: React.FC<DeliveryTimeVsVolumeProps> = ({
  data,
  serviceOrder,
  slaDays,
  showMovingAverage = true,
  movingAverageWindow = 7,
  title = 'Delivery Time vs Service Volume',
  description = 'Average delivery time (line) and requests processed by service type (stacked bars)',
  height = 'h-96',
  className,
}) => {
  if (!data || data.length === 0) {
    return (
      <ChartContainer title={title} description={description} height={height} className={className}>
        <div className="flex items-center justify-center h-full text-muted-foreground">
          No data available
        </div>
      </ChartContainer>
    );
  }

  const periods = data.map(d => d.period);
  const serviceKeys: ServiceKey[] = serviceOrder ?? (Object.keys(data[0]?.volumes ?? {}) as ServiceKey[]);

  // Helper: Moving average calculation
  function movingAverage(series: number[], window: number): number[] {
    return series.map((_, i, arr) => {
      const start = Math.max(0, i - window + 1);
      const slice = arr.slice(start, i + 1);
      const avg = slice.reduce((a, b) => a + b, 0) / slice.length;
      return Number(avg.toFixed(1));
    });
  }

  // Build stacked bar series
  const bars = serviceKeys.map((key) => ({
    name: key,
    type: 'bar' as const,
    stack: 'vol',
    yAxisIndex: 1,
    emphasis: { focus: 'series' },
    data: data.map(d => d.volumes[key] ?? 0),
  }));

  // Moving average line
  const avgDaysData = data.map(d => d.avgDays);
  const ma = showMovingAverage
    ? movingAverage(avgDaysData, movingAverageWindow)
    : null;

  // Build series array
  const series: any[] = [
    ...bars,
    {
      name: 'Avg Delivery Time',
      type: 'line',
      smooth: true,
      yAxisIndex: 0,
      symbol: 'circle',
      symbolSize: 6,
      lineStyle: { width: 3, color: ChartTheme.base.primaryBlue },
      itemStyle: { color: ChartTheme.base.primaryBlue },
      data: avgDaysData,
      ...(slaDays ? {
        markLine: {
          symbol: 'none',
          label: {
            formatter: () => `SLA ${slaDays} days`,
            color: '#444',
            backgroundColor: '#fff',
            padding: [2, 6],
            borderRadius: 3,
          },
          lineStyle: { type: 'dashed', color: '#ff7f0e', width: 2 },
          data: [{ yAxis: slaDays, name: 'SLA' }],
        },
      } : {}),
    },
    ...(ma ? [{
      name: 'MA (Avg Days)',
      type: 'line',
      smooth: true,
      yAxisIndex: 0,
      symbol: 'none',
      lineStyle: { width: 2, opacity: 0.6, color: ChartTheme.base.targetGray },
      itemStyle: { color: ChartTheme.base.targetGray },
      data: ma,
    }] : []),
  ];

  const option = {
    ...ChartTheme.getEChartsOption(),
    title: { text: title, left: 'center', top: 6 },
    tooltip: {
      ...ChartTheme.getEChartsOption().tooltip,
      trigger: 'axis',
      axisPointer: { type: 'cross' },
      valueFormatter: (v: number, s: any) => {
        if (s?.seriesType === 'line') {
          return `${v} days`;
        }
        return Number(v).toLocaleString();
      },
    },
    legend: {
      top: 36,
      data: [...serviceKeys, 'Avg Delivery Time', ...(ma ? ['MA (Avg Days)'] : [])],
    },
    grid: { left: 60, right: 60, top: 70, bottom: 60, containLabel: true },
    dataZoom: [{ type: 'inside' }, { type: 'slider', bottom: 20 }],
    xAxis: {
      type: 'category',
      data: periods,
      axisTick: { alignWithLabel: true },
      axisLabel: { color: ChartTheme.base.neutralGray },
    },
    yAxis: [
      {
        type: 'value',
        name: 'Days',
        min: 0,
        position: 'left',
        axisLabel: { formatter: '{value}', color: ChartTheme.base.neutralGray },
        splitLine: { show: false },
      },
      {
        type: 'value',
        name: 'Requests',
        min: 0,
        position: 'right',
        axisLabel: { formatter: (v: number) => Number(v).toLocaleString(), color: ChartTheme.base.neutralGray },
        splitLine: { show: false },
      },
    ],
    series,
  };

  return (
    <ChartContainer title={title} description={description} height={height} className={className}>
      <ReactECharts option={option} style={{ height: '100%', width: '100%' }} />
    </ChartContainer>
  );
};

export default DeliveryTimeVsVolume;



