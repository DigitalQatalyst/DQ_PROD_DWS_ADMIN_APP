import React from 'react';
import ReactECharts from 'echarts-for-react';
import ChartContainer from './ChartContainer';
import ChartTheme from './ChartTheme';

export interface DeliverySuccessPoint {
  month: string;
  avgDeliveryDays: number; // left axis (line)
  successRate: number;     // right axis (bar)
}

export interface DeliverySuccessComboProps {
  data: DeliverySuccessPoint[];
  title?: string;
  description?: string;
  height?: string;
  className?: string;
}

const DeliverySuccessCombo: React.FC<DeliverySuccessComboProps> = ({
  data,
  title = 'Service Delivery Time vs Success Rate',
  description,
  height = 'h-80',
  className,
}) => {
  const months = data.map(d => d.month);
  const delivery = data.map(d => d.avgDeliveryDays);
  const success = data.map(d => d.successRate);

  const option = {
    ...ChartTheme.getEChartsOption(),
    tooltip: {
      ...ChartTheme.getEChartsOption().tooltip,
      trigger: 'axis',
      axisPointer: { type: 'cross' },
      formatter: (params: any[]) => {
        const month = params?.[0]?.axisValue || '';
        const d = params.find(p => p.seriesName === 'Avg Delivery Time (days)');
        const s = params.find(p => p.seriesName === 'Success Rate (%)');
        return `${month}<br/>Avg Delivery Time: ${d?.value} days<br/>Success Rate: ${s?.value}%`;
      },
    },
    legend: {
      data: ['Avg Delivery Time (days)', 'Success Rate (%)'],
      bottom: 0,
    },
    xAxis: [
      {
        type: 'category',
        data: months,
        axisPointer: { type: 'shadow' },
        axisLabel: { color: ChartTheme.base.neutralGray },
      },
    ],
    yAxis: [
      {
        type: 'value',
        name: 'Avg Delivery Time (days)',
        min: 0,
        max: Math.max(5, Math.ceil(Math.max(...delivery, 0) + 1)),
        position: 'left',
        axisLabel: { formatter: '{value} days', color: ChartTheme.base.neutralGray },
        splitLine: { show: false },
      },
      {
        type: 'value',
        name: 'Success Rate (%)',
        min: 0,
        max: 100,
        position: 'right',
        axisLabel: { formatter: '{value} %', color: ChartTheme.base.neutralGray },
        splitLine: { show: false },
      },
    ],
    series: [
      {
        name: 'Avg Delivery Time (days)',
        type: 'line',
        yAxisIndex: 0,
        data: delivery,
        smooth: true,
        lineStyle: { color: ChartTheme.base.primaryBlue, width: 3 },
        itemStyle: { color: ChartTheme.base.primaryBlue },
        symbol: 'circle',
        symbolSize: 6,
      },
      {
        name: 'Success Rate (%)',
        type: 'bar',
        yAxisIndex: 1,
        data: success,
        itemStyle: { color: ChartTheme.performance.excellent },
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

export default DeliverySuccessCombo;




