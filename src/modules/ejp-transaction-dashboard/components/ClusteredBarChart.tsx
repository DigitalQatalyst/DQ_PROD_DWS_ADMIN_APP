import React from 'react';
import ReactECharts from 'echarts-for-react';
import ChartContainer from './ChartContainer';
import ChartTheme from './ChartTheme';
import { cn } from '../../../utils/cn';

export interface ClusteredBarChartDataPoint {
  month: string;
  onboarding: number;
  activation: number;
  onboardingCount: number;
  activationCount: number;
}

export interface ClusteredBarChartProps {
  data: ClusteredBarChartDataPoint[];
  title?: string;
  description?: string;
  height?: string;
  className?: string;
  showLegend?: boolean;
  showLabels?: boolean;
}

/**
 * ClusteredBarChart - ShadCN UI styled clustered bar chart component
 * Displays Onboarding % and Activation % side by side with consistent theming
 */
const ClusteredBarChart: React.FC<ClusteredBarChartProps> = ({
  data,
  title = 'Onboarding & Activation',
  description,
  height = 'h-80',
  className,
  showLegend = true,
  showLabels = true,
}) => {
  const months = data.map((item) => item.month);
  const onboardingData = data.map((item) => ({ value: item.onboarding, count: item.onboardingCount }));
  const activationData = data.map((item) => ({ value: item.activation, count: item.activationCount }));

  const option = {
    ...ChartTheme.getEChartsOption(),
    tooltip: {
      ...ChartTheme.getEChartsOption().tooltip,
      trigger: 'axis',
      axisPointer: {
        type: 'shadow',
      },
      formatter: function (params: any) {
        const month = params[0].axisValue;
        const onboarding = params.find((p: any) => p.seriesName === 'Onboarding %');
        const activation = params.find((p: any) => p.seriesName === 'Activation %');
        return `${month}<br/>
          ${onboarding?.seriesName}: ${onboarding?.value}% (${onboarding?.data?.count})<br/>
          ${activation?.seriesName}: ${activation?.value}% (${activation?.data?.count})`;
      },
    },
    legend: showLegend
      ? {
          data: ['Onboarding %', 'Activation %'],
          bottom: 0,
        }
      : undefined,
    xAxis: {
      type: 'category',
      data: months,
      axisLabel: {
        color: ChartTheme.base.neutralGray,
      },
    },
    yAxis: {
      type: 'value',
      name: '%',
      min: 0,
      max: 100,
      show: false,
      axisLabel: {
        formatter: '{value}%',
        color: ChartTheme.base.neutralGray,
      },
      splitLine: {
        show: false,
      },
    },
    series: [
      {
        name: 'Onboarding %',
        type: 'bar',
        data: onboardingData,
        itemStyle: {
          color: ChartTheme.base.primaryBlue,
        },
        label: showLabels
          ? {
              show: true,
              position: 'top',
              formatter: (params: any) => {
                const value = params.value;
                const count = params.data.count;
                return `${value}% (${count})`;
              },
              fontSize: 10,
              color: ChartTheme.base.textAxis,
            }
          : undefined,
      },
      {
        name: 'Activation %',
        type: 'bar',
        data: activationData,
        itemStyle: {
          color: ChartTheme.base.secondaryTeal,
        },
        label: showLabels
          ? {
              show: true,
              position: 'top',
              formatter: (params: any) => {
                const value = params.value;
                const count = params.data.count;
                return `${value}% (${count})`;
              },
              fontSize: 10,
              color: ChartTheme.base.textAxis,
            }
          : undefined,
      },
    ],
    grid: {
      left: '0%',
      right: '4%',
      bottom: showLegend ? '15%' : '3%',
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

export default ClusteredBarChart;

