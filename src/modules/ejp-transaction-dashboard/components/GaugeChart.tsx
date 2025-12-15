import React from 'react';
import ReactECharts from 'echarts-for-react';
import ChartContainer from './ChartContainer';
import ChartTheme from './ChartTheme';

export interface GaugeChartProps {
  value: number;
  maxValue: number;
  title?: string;
  className?: string;
  unit?: string;
  thresholds?: {
    warning: number;
    critical: number;
  };
  showValue?: boolean;
  showPercentage?: boolean;
  height?: string;
}

/**
 * GaugeChart - ShadCN UI styled gauge chart component
 * Uses ECharts gauge with ChartTheme colors
 */
const GaugeChart: React.FC<GaugeChartProps> = ({ 
  value, 
  maxValue, 
  title, 
  className = '',
  unit = '%',
  thresholds = { warning: 70, critical: 90 },
  showValue = true,
  showPercentage = true,
  height = 'h-80'
}) => {
  const percentage = (value / maxValue) * 100;
  
  // Determine color based on thresholds using ChartTheme
  const getColor = () => {
    if (percentage >= thresholds.critical) return ChartTheme.performance.critical;
    if (percentage >= thresholds.warning) return ChartTheme.performance.moderate;
    return ChartTheme.performance.good;
  };

  const option = {
    ...ChartTheme.getEChartsOption(),
    series: [
      {
        name: title || 'Gauge',
        type: 'gauge',
        startAngle: 200,
        endAngle: -20,
        min: 0,
        max: maxValue,
        splitNumber: 8,
        axisLine: {
          lineStyle: {
            width: 10,
            color: [
              [thresholds.warning / 100, ChartTheme.performance.good],
              [thresholds.critical / 100, ChartTheme.performance.moderate],
              [1, ChartTheme.performance.critical]
            ]
          }
        },
        pointer: {
          itemStyle: {
            color: getColor()
          }
        },
        axisTick: {
          distance: -30,
          splitNumber: 5,
          lineStyle: {
            width: 2,
            color: ChartTheme.base.neutralGray
          }
        },
        splitLine: {
          distance: -35,
          length: 14,
          lineStyle: {
            width: 3,
            color: ChartTheme.base.neutralGray
          }
        },
        axisLabel: {
          distance: -20,
          color: ChartTheme.base.neutralGray,
          fontSize: 12
        },
        detail: {
          valueAnimation: true,
          width: '60%',
          lineHeight: 40,
          borderRadius: 8,
          offsetCenter: [0, '-15%'],
          fontSize: 30,
          fontWeight: 'bold',
          formatter: `{value}${unit}`,
          color: ChartTheme.base.textAxis
        },
        data: [
          {
            value: value,
            name: showPercentage ? `${percentage.toFixed(1)}%` : undefined
          }
        ]
      }
    ]
  };

  return (
    <ChartContainer title={title} className={className} height={height}>
      <ReactECharts option={option} style={{ height: '100%', width: '100%' }} />
    </ChartContainer>
  );
};

export default GaugeChart;
