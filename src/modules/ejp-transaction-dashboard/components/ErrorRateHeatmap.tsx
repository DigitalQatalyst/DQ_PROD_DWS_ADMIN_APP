import React from 'react';
import ReactECharts from 'echarts-for-react';
import ChartContainer from './ChartContainer';
import ChartTheme from './ChartTheme';

export interface ErrorRateDataPoint {
  service: string;
  region: string;
  errorRate: number; // percentage (e.g., 1.2 means 1.2%)
}

export interface ErrorRateHeatmapProps {
  data: ErrorRateDataPoint[];
  title?: string;
  description?: string;
  height?: string;
  className?: string;
}

const ErrorRateHeatmap: React.FC<ErrorRateHeatmapProps> = ({
  data,
  title = 'Error Rate by Service & Region',
  description,
  height = 'h-96',
  className,
}) => {
  const regions = [...new Set(data.map(d => d.region))].reverse(); // Global->MENA->GCC->UAE top to bottom
  const services = [...new Set(data.map(d => d.service))];
  
  // Transform to ECharts format: [serviceIndex, regionIndex, errorRate%]
  const values = data.map(d => [
    services.indexOf(d.service),
    regions.indexOf(d.region),
    d.errorRate,
  ]);
  
  const maxVal = Math.max(...data.map(d => d.errorRate), 1.5);

  const option = {
    backgroundColor: 'transparent',
    grid: { left: 100, right: 250, top: 30, bottom: 40 },
    tooltip: {
      trigger: 'item',
      position: 'top',
      formatter: (p: any) => {
        const s = services[p.value[0]];
        const r = regions[p.value[1]];
        const v = p.value[2].toFixed(1);
        return `${s} - ${r}: <b>${v}%</b>`;
      },
    },
    toolbox: {
      show: true,
      right: 10,
      feature: {
        saveAsImage: { title: 'Save' },
        dataView: { readOnly: true, title: 'Data' },
        restore: { title: 'Reset' },
      },
    },
    xAxis: {
      type: 'category',
      data: services,
      axisLabel: { interval: 0, color: ChartTheme.base.neutralGray },
      axisTick: { show: false },
      splitArea: { show: true },
    },
    yAxis: {
      type: 'category',
      data: regions,
      axisTick: { show: false },
      splitArea: { show: true },
      axisLabel: { color: ChartTheme.base.neutralGray },
    },
    visualMap: {
      type: 'piecewise',
      right: 10,
      top: 'middle',
      align: 'left',
      precision: 1,
      calculable: true,
      pieces: [
        { min: 1.0, max: maxVal, label: 'High (≥ 1.0%)', color: '#d73027' },
        { min: 0.6, max: 0.999, label: 'Medium (0.6–0.99%)', color: '#fc8d59' },
        { min: 0.3, max: 0.599, label: 'Low (0.3–0.59%)', color: '#fee08b' },
        { min: 0, max: 0.299, label: 'Very Low (< 0.3%)', color: '#d9ef8b' },
      ],
      outOfRange: { color: '#1a9850' },
      textStyle: { color: ChartTheme.base.neutralGray },
      itemGap: 8,
      itemWidth: 15,
      itemHeight: 12,
      padding: [0, 0, 0, 0],
    },
    series: [
      {
        type: 'heatmap',
        data: values,
        label: {
          show: true,
          formatter: ({ value }: any) => `${value[2].toFixed(1)}%`,
          color: '#0b1220',
          fontWeight: 600,
          fontSize: 11,
        },
        emphasis: {
          itemStyle: {
            borderColor: '#222',
            borderWidth: 2,
            shadowBlur: 10,
            shadowColor: 'rgba(0, 0, 0, 0.3)',
          },
        },
        markPoint: {
          symbol: 'pin',
          symbolSize: 40,
          label: {
            formatter: '{c}%',
            color: '#fff',
            fontWeight: 700,
            fontSize: 10,
          },
          data: (() => {
            const mx = Math.max(...values.map((v: any) => v[2]));
            return values
              .filter((v: any) => v[2] === mx)
              .map((v: any) => ({
                xAxis: v[0],
                yAxis: v[1],
                value: v[2].toFixed(1),
              }));
          })(),
          itemStyle: {
            color: '#b10026',
            shadowBlur: 8,
            shadowColor: 'rgba(0,0,0,.25)',
          },
          tooltip: { show: false },
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

export default ErrorRateHeatmap;

