import React from 'react';
import ReactECharts from 'echarts-for-react';
import ChartContainer from './ChartContainer';
import ChartTheme from './ChartTheme';

export interface FirstResponseTimeDataPoint {
  serviceType: string; // e.g., 'Financial', 'Non-Financial', 'Advisory', 'Training'
  avgHours: number; // Average time to first response in hours
}

export interface FirstResponseTimeProps {
  data: FirstResponseTimeDataPoint[];
  targetHours?: number; // Target SLA in hours (default 4)
  title?: string;
  description?: string;
  height?: string;
  className?: string;
}

/**
 * FirstResponseTime - Bar chart showing average time to first response by service type with target line
 */
const FirstResponseTime: React.FC<FirstResponseTimeProps> = ({
  data,
  targetHours = 4,
  title = 'Service Response Time Analysis',
  description = 'Average time from service request creation to first response by service team.',
  height = 'h-80',
  className,
}) => {
  const serviceTypes = data.map((item) => item.serviceType);
  const avgHours = data.map((item) => item.avgHours);

  // Distinct colors per service type for clearer comparison
  const serviceTypeColors = ['#42A5F5', '#10B981', '#FF7043', '#AB47BC', '#F59E0B', '#3B82F6'];

  const option = {
    ...ChartTheme.getEChartsOption(),
    title: {
      text: title,
      left: 'center',
      top: 6,
      textStyle: {
        fontWeight: 600,
        fontSize: 16,
      },
    },
    tooltip: {
      ...ChartTheme.getEChartsOption().tooltip,
      trigger: 'axis',
      formatter: (params: any) => {
        const param = params[0];
        const serviceType = param.axisValue;
        const value = Number(param.value).toFixed(1);
        return `${serviceType}: <b>${value} hrs</b>`;
      },
    },
    legend: {
      top: 36,
      data: ['Average Response Time'],
    },
    grid: {
      left: 60,
      right: 30,
      top: 70,
      bottom: 50,
    },
    xAxis: {
      type: 'category',
      data: serviceTypes,
      axisTick: {
        alignWithLabel: true,
      },
      axisLabel: {
        rotate: 45,
      },
    },
    yAxis: {
      type: 'value',
      name: 'Hours',
      min: 0,
      axisLabel: {
        formatter: '{value} hrs',
      },
      splitLine: {
        show: true,
        lineStyle: {
          type: 'dashed',
        },
      },
    },
    series: [
      {
        name: 'Average Response Time',
        type: 'bar',
        data: avgHours.map((value, index) => ({
          value,
          itemStyle: {
            color: serviceTypeColors[index % serviceTypeColors.length],
          },
        })),
        barWidth: '60%',
        label: {
          show: true,
          position: 'top',
          formatter: (p: any) => `${Number(p.value).toFixed(1)} hrs`,
        },
        markLine: {
          symbol: 'none',
          label: {
            formatter: `SLA Target: ${targetHours} hrs`,
            position: 'end',
            color: '#dc2626',
            backgroundColor: '#fff',
            padding: [2, 6],
            borderRadius: 3,
          },
          lineStyle: {
            color: '#dc2626',
            type: 'dashed',
            width: 2,
          },
          data: [
            {
              yAxis: targetHours,
              name: 'SLA Target',
            },
          ],
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

export default FirstResponseTime;

