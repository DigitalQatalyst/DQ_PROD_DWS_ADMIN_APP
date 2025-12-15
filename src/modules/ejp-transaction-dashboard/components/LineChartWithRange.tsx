import React from 'react';
import ReactECharts from 'echarts-for-react';
import { EChartsOption } from 'echarts';
import ChartContainer from './ChartContainer';
import ChartTheme from './ChartTheme';

export interface LineChartWithRangeDataPoint {
  month: string;
  avg: number;
  min: number;
  max: number;
}

export interface LineChartWithRangeProps {
  data: LineChartWithRangeDataPoint[];
  title?: string;
  description?: string;
  height?: string;
  className?: string;
  showLegend?: boolean;
  showLabels?: boolean;
  insightText?: string;
  insightMonth?: string;
}

/**
 * LineChartWithRange - ShadCN UI styled line chart with range ribbon
 * Shows average line with min-max range band
 */
const LineChartWithRange: React.FC<LineChartWithRangeProps> = ({
  data,
  title = 'Time to Activation',
  description,
  height = 'h-64',
  className,
  showLegend = true,
  showLabels = true,
  insightText,
  insightMonth,
}) => {
  const months = data.map((item) => item.month);
  const avgData = data.map((item) => item.avg);
  const minData = data.map((item) => item.min);
  const maxData = data.map((item) => item.max);

  // Find lowest and latest indices for labels
  const lowestIndex = avgData.indexOf(Math.min(...avgData));
  const latestIndex = data.length - 1;
  const firstIndex = 0;

  // Calculate range values (max - min) for stacked area
  const rangeData = data.map((item) => item.max - item.min);

  const option: EChartsOption = {
    ...ChartTheme.getEChartsOption(),
    tooltip: {
      ...ChartTheme.getEChartsOption().tooltip,
      trigger: 'axis' as const,
      formatter: function (params: any) {
        const avgParam = params.find((p: any) => p.seriesName === 'Avg');
        if (!avgParam) return '';
        const monthIndex = avgParam.dataIndex;
        const rangeParam = params.find((p: any) => p.seriesName === 'Range (Min–Max)');
        return `${avgParam.axisValue}<br/>
          <span style="display:inline-block;margin-right:5px;border-radius:10px;width:10px;height:10px;background-color:${ChartTheme.base.primaryBlue};"></span>Average: ${avgParam.value.toFixed(1)} days<br/>
          <span style="display:inline-block;margin-right:5px;border-radius:10px;width:10px;height:10px;background-color:${ChartTheme.base.secondaryTeal};"></span>Range: ${minData[monthIndex]} - ${maxData[monthIndex]} days`;
      },
    },
    legend: showLegend
      ? {
          data: ['Avg', 'Range (Min–Max)'],
          bottom: 0,
          itemGap: 20,
        }
      : undefined,
    xAxis: {
      type: 'category' as const,
      data: months,
      axisLabel: {
        color: ChartTheme.base.neutralGray,
      },
    },
    yAxis: {
      type: 'value' as const,
      name: 'Days',
      min: 0,
      max: 3,
      show: false,
      axisLabel: {
        formatter: '{value}d',
        color: ChartTheme.base.neutralGray,
      },
      splitLine: {
        show: false,
      },
    },
    series: [
      {
        name: 'Min Base',
        type: 'line',
        data: minData,
        lineStyle: {
          opacity: 0,
        },
        stack: 'range',
        symbol: 'none',
        label: {
          show: false,
        },
        z: 1,
        silent: true,
      },
      {
        name: 'Range (Min–Max)',
        type: 'line',
        data: rangeData,
        areaStyle: {
          color: ChartTheme.base.secondaryTeal + '33', // rgba with transparency
        },
        lineStyle: {
          color: ChartTheme.base.secondaryTeal,
          width: 1,
          opacity: 0.6,
        },
        stack: 'range',
        symbol: 'none',
        label: {
          show: false,
        },
        z: 2,
      },
      {
        name: 'Avg',
        type: 'line',
        data: avgData,
        smooth: true,
        lineStyle: {
          color: ChartTheme.base.primaryBlue,
          width: 4,
        },
        itemStyle: {
          color: ChartTheme.base.primaryBlue,
          borderWidth: 2,
          borderColor: '#ffffff',
        },
        symbol: 'circle',
        symbolSize: 8,
        z: 10,
        label: showLabels
          ? {
              show: true,
              position: 'top',
              distance: 8,
              formatter: (params: any) => {
                const value = params.value;
                return `${value.toFixed(1)}d`;
              },
              fontSize: 11,
              color: ChartTheme.base.textAxis,
              fontWeight: 600,
            }
          : { show: false },
      },
    ],
    grid: {
      left: '3%',
      right: '4%',
      bottom: showLegend ? '15%' : '3%',
      top: '15%',
      containLabel: true,
    },
  };

  return (
    <ChartContainer title={title} description={description} height={height} className={className}>
      <ReactECharts option={option} style={{ height: '100%', width: '100%' }} />
    </ChartContainer>
  );
};

export default LineChartWithRange;

