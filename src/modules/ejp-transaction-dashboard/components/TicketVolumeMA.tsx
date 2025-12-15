import React from 'react';
import ReactECharts from 'echarts-for-react';
import ChartContainer from './ChartContainer';
import ChartTheme from './ChartTheme';

export interface TicketVolumeMAPoint {
  date: string; // ISO date or label
  high: number;
  medium: number;
  low: number;
}

export interface TicketVolumeMAProps {
  data: TicketVolumeMAPoint[];
  title?: string;
  description?: string;
  height?: string;
  className?: string;
}

const TicketVolumeMA: React.FC<TicketVolumeMAProps> = ({
  data,
  title = 'Support Ticket Volume',
  description = 'Stacked by priority + 7-day MA trend',
  height = 'h-80',
  className,
}) => {
  const days = data.map(d => d.date);
  const high = data.map(d => d.high);
  const medium = data.map(d => d.medium);
  const low = data.map(d => d.low);
  const totals = data.map((_, i) => high[i] + medium[i] + low[i]);

  function movingAverage(series: number[], window = 7) {
    return series.map((_, i, arr) => {
      const start = Math.max(0, i - window + 1);
      const slice = arr.slice(start, i + 1);
      const avg = slice.reduce((a, b) => a + b, 0) / slice.length;
      return Number(avg.toFixed(1));
    });
  }
  const ma7 = movingAverage(totals, 7);

  const option = {
    ...ChartTheme.getEChartsOption(),
    tooltip: {
      ...ChartTheme.getEChartsOption().tooltip,
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      formatter: (params: any[]) => {
        const idx = params?.[0]?.dataIndex ?? 0;
        const date = days[idx];
        const highV = high[idx] ?? 0;
        const medV = medium[idx] ?? 0;
        const lowV = low[idx] ?? 0;
        const total = highV + medV + lowV;
        const prev = idx > 0 ? totals[idx - 1] : total;
        const deltaPct = prev ? (((total - prev) / prev) * 100).toFixed(1) : '0.0';
        const sign = Number(deltaPct) >= 0 ? '+' : '';
        return `${date}<br/>High: ${highV.toLocaleString()} tickets` +
               `<br/>Medium: ${medV.toLocaleString()} tickets` +
               `<br/>Low: ${lowV.toLocaleString()} tickets` +
               `<br/><b>Total: ${total.toLocaleString()} tickets (${sign}${deltaPct}%)</b>`;
      },
    },
    legend: {
      orient: 'vertical',
      right: 10,
      top: 'middle',
      itemWidth: 14,
      itemHeight: 14,
      itemGap: 12,
      textStyle: {
        color: ChartTheme.base.neutralGray,
      },
    },
    grid: { left: 60, right: 120, top: 30, bottom: 60 },
    dataZoom: [{ type: 'inside' }, { type: 'slider', bottom: 20 }],
    xAxis: { 
      type: 'category', 
      data: days, 
      axisTick: { show: false }, 
      axisLabel: { show: false },
      name: '', 
      nameLocation: 'middle',
    },
    yAxis: {
      type: 'value',
      name: '',
      axisLabel: { show: false },
      splitLine: { show: true, lineStyle: { type: 'dashed' } },
    },
    series: [
      {
        name: 'High Priority',
        type: 'bar',
        stack: 'tickets',
        itemStyle: { color: '#FF3333' },
        label: { show: true, position: 'top', formatter: '{c}' },
        data: high,
      },
      {
        name: 'Medium Priority',
        type: 'bar',
        stack: 'tickets',
        itemStyle: { color: '#FF8C00' },
        label: { show: true, position: 'top', formatter: '{c}' },
        data: medium,
      },
      {
        name: 'Low Priority',
        type: 'bar',
        stack: 'tickets',
        itemStyle: { color: '#4CAF50' },
        label: { show: true, position: 'top', formatter: '{c}' },
        data: low,
      },
      {
        name: '7-day MA',
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 6,
        lineStyle: { width: 3, type: 'dashed', color: '#00B0FF' },
        itemStyle: { color: '#00B0FF' },
        data: ma7,
        markPoint: {
          data: [
            {
              name: 'trend',
              value: ma7[ma7.length - 1],
              xAxis: days[days.length - 1],
              yAxis: ma7[ma7.length - 1],
              symbol: 'triangle',
              symbolSize: 14,
              symbolRotate: ma7.length > 1 && ma7[ma7.length - 1] < ma7[ma7.length - 2] ? 180 : 0,
              itemStyle: {
                color:
                  ma7.length > 1 && ma7[ma7.length - 1] < ma7[ma7.length - 2]
                    ? '#EF4444'
                    : '#10B981',
              },
              label: { show: false },
            },
          ],
        },
        markLine: {
          symbol: 'none',
          lineStyle: { color: '#9CA3AF', type: 'dotted' },
          label: {
            formatter: (p: any) => (p?.value ? `Threshold: ${p.value}` : ''),
            color: '#6B7280',
          },
          data: [
            { yAxis: 50 },
            { yAxis: 100 },
          ],
        },
      },
    ],
  } as any;

  return (
    <ChartContainer title={title} height={height} className={className}>
      <ReactECharts option={option} style={{ height: '100%', width: '100%' }} />
    </ChartContainer>
  );
};

export default TicketVolumeMA;
