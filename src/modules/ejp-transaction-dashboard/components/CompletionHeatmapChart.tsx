import React from 'react';
import ReactECharts from 'echarts-for-react';
import ChartContainer from './ChartContainer';
import ChartTheme from './ChartTheme';

export interface CompletionHeatmapDataPoint {
  task: string;
  month: string;
  value: number;
  completed?: number;
  total?: number;
}

export interface CompletionHeatmapChartProps {
  data: CompletionHeatmapDataPoint[];
  tasks: string[];
  months: string[];
  title?: string;
  description?: string;
  height?: string;
  className?: string;
}

/**
 * CompletionHeatmapChart - ShadCN UI styled heatmap for completion rates
 * Uses performance gradient: Low (red) → Mid (amber) → High (green)
 */
const CompletionHeatmapChart: React.FC<CompletionHeatmapChartProps> = ({
  data,
  tasks,
  months,
  title = 'Completion Rate of Onboarding Tasks',
  description,
  height = 'h-96',
  className,
}) => {
  // Transform data to ECharts format: [month, task, value]
  const heatmapData = data.map((item) => [item.month, item.task, item.value]);

  const option = {
    ...ChartTheme.getEChartsOption(),
    tooltip: {
      ...ChartTheme.getEChartsOption().tooltip,
      position: 'top',
      formatter: function (params: any) {
        const heatmapDataPoint = params.data;
        const task = heatmapDataPoint[1];
        const month = heatmapDataPoint[0];
        const value = heatmapDataPoint[2];
        // Find the original data item for completed/total
        const item = data.find((d: CompletionHeatmapDataPoint) => d.task === task && d.month === month);
        const completed = item?.completed || Math.round((value / 100) * 400);
        const total = item?.total || 400;
        const prevValue = value > 70 ? value - 5 : value + 5; // Mock previous value
        const change = value - prevValue;
        return `${task} — ${month}<br/>
          ${value}% (${completed}/${total})<br/>
          Change vs prev: ${change > 0 ? '+' : ''}${change} pts`;
      },
    },
    grid: {
      height: '70%',
      top: '10%',
      left: '15%',
      right: '20%',
    },
    xAxis: {
      type: 'category',
      data: months,
      splitArea: {
        show: true,
      },
      axisLabel: {
        color: ChartTheme.base.neutralGray,
      },
    },
    yAxis: {
      type: 'category',
      data: tasks,
      splitArea: {
        show: true,
      },
      axisLabel: {
        color: ChartTheme.base.neutralGray,
      },
    },
    visualMap: {
      min: 0,
      max: 100,
      calculable: true,
      orient: 'vertical',
      left: 'right',
      top: 'center',
      text: ['High', 'Low'],
      textStyle: {
        color: ChartTheme.base.neutralGray,
      },
      inRange: {
        color: [
          ChartTheme.performance.critical, // Low (<70%)
          ChartTheme.performance.moderate,  // Mid (70-89%)
          ChartTheme.performance.excellent, // High (≥90%)
        ],
      },
    },
    series: [
      {
        name: 'Completion Rate',
        type: 'heatmap',
        data: heatmapData,
        label: {
          show: true,
          color: '#ffffff',
          fontSize: 10,
        },
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowColor: 'rgba(0, 0, 0, 0.5)',
          },
        },
      },
    ],
  };

  return (
    <ChartContainer title={title} description={description} height={height} className={className}>
      <ReactECharts option={option} style={{ height: '100%', width: '100%' }} />
    </ChartContainer>
  );
};

export default CompletionHeatmapChart;

