import React from 'react';
import ReactECharts from 'echarts-for-react';
import ChartContainer from './ChartContainer';
import ChartTheme from './ChartTheme';

export interface HeatmapChartDataPoint {
  x: string;
  y: string;
  value: number;
  label?: string;
}

export interface HeatmapChartProps {
  data: HeatmapChartDataPoint[];
  title?: string;
  className?: string;
  xAxisLabel?: string;
  yAxisLabel?: string;
  height?: string;
}

/**
 * HeatmapChart - ShadCN UI styled heatmap chart component
 * Uses ECharts heatmap with ChartTheme colors
 */
const HeatmapChart: React.FC<HeatmapChartProps> = ({ 
  data, 
  title, 
  className = '',
  xAxisLabel = 'X Axis',
  yAxisLabel = 'Y Axis',
  height = 'h-80'
}) => {
  // Get unique x and y values
  const xValues = [...new Set(data.map(d => d.x))];
  const yValues = [...new Set(data.map(d => d.y))];
  
  // Get min and max values for color scaling
  const values = data.map(d => d.value);
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);
  
  // Transform data to ECharts format: [x, y, value]
  const heatmapData = data.map(d => {
    const xIndex = xValues.indexOf(d.x);
    const yIndex = yValues.indexOf(d.y);
    return [xIndex, yIndex, d.value];
  });

  const option = {
    ...ChartTheme.getEChartsOption(),
    tooltip: {
      ...ChartTheme.getEChartsOption().tooltip,
      position: 'top',
      formatter: function(params: any) {
        const data = params.data;
        const x = xValues[data[0]];
        const y = yValues[data[1]];
        const value = data[2];
        return `${x} × ${y}<br/>
          Value: ${value.toFixed(2)}`;
      }
    },
    grid: {
      height: '70%',
      top: '10%',
      left: '15%',
      right: '20%'
    },
    xAxis: {
      type: 'category',
      data: xValues,
      splitArea: {
        show: true
      },
      axisLabel: {
        color: ChartTheme.base.neutralGray
      }
    },
    yAxis: {
      type: 'category',
      data: yValues,
      splitArea: {
        show: true
      },
      axisLabel: {
        color: ChartTheme.base.neutralGray
      }
    },
    visualMap: {
      min: minValue,
      max: maxValue,
      calculable: true,
      orient: 'vertical',
      left: 'right',
      top: 'center',
      text: ['High', 'Low'],
      textStyle: {
        color: ChartTheme.base.neutralGray
      },
      inRange: {
        color: [
          ChartTheme.base.primaryBlue,
          ChartTheme.base.secondaryTeal
        ]
      }
    },
    series: [
      {
        name: title || 'Heatmap',
        type: 'heatmap',
        data: heatmapData,
        label: {
          show: true,
          color: '#ffffff',
          fontSize: 10
        },
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }
    ]
  };

  return (
    <ChartContainer title={title} className={className} height={height}>
      <ReactECharts option={option} style={{ height: '100%', width: '100%' }} />
    </ChartContainer>
  );
};

export default HeatmapChart;
