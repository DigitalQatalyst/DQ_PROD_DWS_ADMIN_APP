import React from 'react';
import ReactECharts from 'echarts-for-react';
import ChartContainer from './ChartContainer';
import ChartTheme from './ChartTheme';

export interface LineChartWithTrendDataPoint {
  month: string;
  value: number;
  movingAverage: number;
}

export interface LineChartWithTrendProps {
  data: LineChartWithTrendDataPoint[];
  title?: string;
  description?: string;
  height?: string;
  className?: string;
  showLegend?: boolean;
  showLabels?: boolean;
  ariaDescription?: string;
}

/**
 * LineChartWithTrend - ShadCN UI styled bar chart with trendline overlay
 * Shows monthly active user rate with bars and 3-month moving average
 */
const LineChartWithTrend: React.FC<LineChartWithTrendProps> = ({
  data,
  title = 'Active User Rate',
  description,
  height = 'h-80',
  className,
  showLegend = true,
  showLabels = true,
  ariaDescription = 'Monthly active user rate with bars and 3-month trendline.',
}) => {
  const months = data.map((item) => item.month);
  const valueData = data.map((item) => item.value);
  const movingAverageData = data.map((item) => item.movingAverage);

  const option = {
    ...ChartTheme.getEChartsOption(),
    aria: {
      enabled: true,
      label: {
        description: ariaDescription,
      },
    },
    tooltip: {
      ...ChartTheme.getEChartsOption().tooltip,
      trigger: 'axis',
      axisPointer: {
        type: 'shadow',
      },
    },
    legend: showLegend
      ? {
          data: ['Active User Rate', '3-Month Moving Average'],
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
        name: 'Active User Rate',
        type: 'bar',
        data: valueData,
        itemStyle: {
          color: ChartTheme.base.primaryBlue,
        },
        label: showLabels
          ? {
              show: true,
              position: 'top',
              formatter: '{c}%',
              fontSize: 10,
              color: ChartTheme.base.textAxis,
            }
          : undefined,
      },
      {
        name: '3-Month Moving Average',
        type: 'line',
        data: movingAverageData,
        lineStyle: {
          color: ChartTheme.base.targetGray,
          width: 2,
          type: 'dashed',
        },
        symbol: 'none',
        smooth: true,
        label: showLabels
          ? {
              show: true,
              position: 'top',
              formatter: (params: any) => {
                return `${params.value.toFixed(1)}%`;
              },
              fontSize: 9,
              color: ChartTheme.base.targetGray,
            }
          : undefined,
      },
    ],
    grid: {
      left: '3%',
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

export default LineChartWithTrend;

