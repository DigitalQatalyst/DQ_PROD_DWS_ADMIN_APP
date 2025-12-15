import React from 'react';
import ReactECharts from 'echarts-for-react';
import ChartContainer from './ChartContainer';
import ChartTheme from './ChartTheme';

export interface ErrorRateByServiceData {
  serviceType: string;
  errorRate: number; // percentage (e.g., 5 means 5%)
}

export interface ErrorRateByServiceProps {
  data: ErrorRateByServiceData[];
  title?: string;
  description?: string;
  height?: string;
  className?: string;
}

const ErrorRateByService: React.FC<ErrorRateByServiceProps> = ({
  data,
  title = 'Error Rate by Service Type',
  description = 'Percentage of error occurrences by service type.',
  height = 'h-80',
  className,
}) => {
  const serviceTypes = data.map(d => d.serviceType);
  const errorRates = data.map(d => d.errorRate);

  // Determine color based on error rate: Green (low), Yellow (medium), Orange (medium-high), Red (high)
  const getBarColor = (rate: number) => {
    if (rate < 3) return '#4CAF50'; // Green - low error rate
    if (rate < 6) return '#FFEB3B'; // Yellow - medium error rate
    if (rate < 10) return '#FF9800'; // Orange - medium-high error rate
    return '#F44336'; // Red - high error rate
  };

  const option = {
    ...ChartTheme.getEChartsOption(),
    title: {
      text: title,
      subtext: description,
      left: 'center',
      top: 6,
    },
    tooltip: {
      ...ChartTheme.getEChartsOption().tooltip,
      trigger: 'axis',
      formatter: (params: any[]) => {
        const param = params[0];
        const serviceType = param.name;
        const errorRate = param.value;
        return `${serviceType}<br/>Error Rate: <b>${errorRate.toFixed(2)}%</b>`;
      },
    },
    legend: {
      data: ['Error Rate'],
      top: 36,
    },
    grid: {
      left: '10%',
      right: '10%',
      top: '20%',
      bottom: '15%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: serviceTypes,
      axisLabel: {
        rotate: 45,
        color: ChartTheme.base.neutralGray,
      },
      axisTick: {
        alignWithLabel: true,
      },
    },
    yAxis: {
      type: 'value',
      name: 'Error Rate (%)',
      axisLabel: {
        formatter: '{value}%',
        color: ChartTheme.base.neutralGray,
      },
      splitLine: {
        show: true,
        lineStyle: {
          type: 'dashed',
          color: ChartTheme.base.neutralGray,
          opacity: 0.3,
        },
      },
    },
    series: [
      {
        name: 'Error Rate',
        type: 'bar',
        data: errorRates.map((rate, index) => ({
          value: rate,
          itemStyle: {
            color: getBarColor(rate),
          },
        })),
        label: {
          show: true,
          position: 'top',
          formatter: '{c}%',
          color: ChartTheme.base.foreground,
          fontWeight: 600,
        },
        barWidth: '50%',
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowOffsetY: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)',
          },
        },
      },
    ],
  } as any;

  return (
    <ChartContainer title={title} description={description} height={height} className={className}>
      <ReactECharts option={option} style={{ height: '100%', width: '100%' }} />
    </ChartContainer>
  );
};

export default ErrorRateByService;

