import React from 'react';
import ReactECharts from 'echarts-for-react';
import ChartContainer from './ChartContainer';
import ChartTheme from './ChartTheme';

export interface BarChartWithGradientDataPoint {
  month: string;
  value: number;
}

export interface BarChartWithGradientProps {
  data: BarChartWithGradientDataPoint[];
  title?: string;
  description?: string;
  height?: string;
  className?: string;
  showLabels?: boolean;
  thresholds?: {
    low: number;    // Below this is good (green)
    moderate: number; // Below this is moderate (amber)
    // Above moderate is critical (red)
  };
  getColor?: (value: number) => string;
}

/**
 * BarChartWithGradient - ShadCN UI styled bar chart with gradient colors based on value
 * Uses performance gradient colors (green → amber → red) based on thresholds
 */
const BarChartWithGradient: React.FC<BarChartWithGradientProps> = ({
  data,
  title = 'Drop-off Rate During Onboarding',
  description,
  height = 'h-64',
  className,
  showLabels = true,
  thresholds = { low: 10, moderate: 15 },
  getColor,
}) => {
  const months = data.map((item) => item.month);
  const colorFunction = getColor || ((value: number) => ChartTheme.getDropoffColor(value));

  const seriesData = data.map((item) => ({
    value: item.value,
    itemStyle: { color: colorFunction(item.value) },
  }));

  const option = {
    ...ChartTheme.getEChartsOption(),
    tooltip: {
      ...ChartTheme.getEChartsOption().tooltip,
      trigger: 'axis',
      formatter: function (params: any) {
        const data = params[0];
        return `${data.axisValue}: ${data.value}% drop-off rate`;
      },
    },
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
      max: 25,
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
        name: 'Drop-off Rate',
        type: 'bar',
        data: seriesData,
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
    ],
    grid: {
      left: '5%',
      right: '5%',
      bottom: '8%',
      top: '10%',
      containLabel: true,
    },
  };

  return (
    <ChartContainer title={title} description={description} height={height} className={className}>
      <div className="relative h-full">
        <ReactECharts option={option} style={{ height: 'calc(100% - 32px)', width: '100%' }} />
        <div className="absolute bottom-0 left-0 right-0 flex items-center justify-center gap-6 pt-2">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: ChartTheme.performance.good }}></div>
            <span className="text-xs text-muted-foreground">{`< ${thresholds.low}%`}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: ChartTheme.performance.moderate }}></div>
            <span className="text-xs text-muted-foreground">{`${thresholds.low}% - ${thresholds.moderate}%`}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: ChartTheme.performance.critical }}></div>
            <span className="text-xs text-muted-foreground">{`> ${thresholds.moderate}%`}</span>
          </div>
        </div>
      </div>
    </ChartContainer>
  );
};

export default BarChartWithGradient;

