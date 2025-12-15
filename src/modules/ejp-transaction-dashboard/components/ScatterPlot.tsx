import React from 'react';
import ReactECharts from 'echarts-for-react';
import ChartContainer from './ChartContainer';
import ChartTheme from './ChartTheme';

export interface ScatterPlotDataPoint {
  x: number;
  y: number;
  label?: string;
  value?: number;
  name?: string;
}

export interface ScatterPlotProps {
  data: ScatterPlotDataPoint[];
  title?: string;
  className?: string;
  xAxisLabel?: string;
  yAxisLabel?: string;
  height?: string;
  showTrendLine?: boolean;
  chartType?: 'scatter' | 'line';
  smooth?: boolean;
  lineColor?: string;
  xAxisFormatter?: (v: number) => string;
  yAxisFormatter?: (v: number) => string;
}

/**
 * ScatterPlot - ShadCN UI styled scatter plot component
 * Uses ECharts scatter with ChartTheme colors
 */
const ScatterPlot: React.FC<ScatterPlotProps> = ({ 
  data, 
  title, 
  className = '',
  xAxisLabel = 'X Axis',
  yAxisLabel = 'Y Axis',
  height = 'h-80',
  showTrendLine = true,
  chartType = 'scatter',
  smooth = true,
  lineColor = ChartTheme.base.primaryBlue,
  xAxisFormatter,
  yAxisFormatter,
}) => {
  const scatterData = data.map(d => [d.x, d.y, d.value || 0]);
  const lineData = data.map(d => [d.x, d.y]);
  
  // Calculate trend line if needed
  let markLine = undefined;
  if (showTrendLine && data.length >= 2) {
    const n = data.length;
    const sumX = data.reduce((sum, d) => sum + d.x, 0);
    const sumY = data.reduce((sum, d) => sum + d.y, 0);
    const sumXY = data.reduce((sum, d) => sum + d.x * d.y, 0);
    const sumXX = data.reduce((sum, d) => sum + d.x * d.x, 0);
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;
    
    const xMin = Math.min(...data.map(d => d.x));
    const xMax = Math.max(...data.map(d => d.x));
    const y1 = slope * xMin + intercept;
    const y2 = slope * xMax + intercept;
    
    markLine = {
      data: [[{ coord: [xMin, y1] }, { coord: [xMax, y2] }]],
      lineStyle: {
        color: ChartTheme.base.targetGray,
        type: 'dashed',
        width: 2,
        opacity: 0.7
      }
    };
  }

  const option = {
    ...ChartTheme.getEChartsOption(),
    tooltip: chartType === 'line'
      ? {
          ...ChartTheme.getEChartsOption().tooltip,
          trigger: 'axis',
          formatter: function(params: any[]) {
            if (!params || !params.length) return '';
            const p = params[0];
            const [x, y] = p.value as [number, number];
            return `${xAxisLabel}: ${x}${xAxisFormatter ? '' : ''}<br/>${yAxisLabel}: ${y}${yAxisFormatter ? '' : ''}`;
          }
        }
      : {
          ...ChartTheme.getEChartsOption().tooltip,
          trigger: 'item',
          formatter: function(params: any) {
            const point = params.data;
            const dataPoint = data[params.dataIndex];
            return `${dataPoint.label || dataPoint.name || 'Point'}<br/>
          ${xAxisLabel}: ${point[0].toFixed(2)}<br/>
          ${yAxisLabel}: ${point[1].toFixed(2)}${dataPoint.value ? `<br/>Value: ${dataPoint.value}` : ''}`;
          }
        },
    xAxis: {
      type: 'value',
      name: xAxisLabel,
      nameLocation: 'middle',
      nameGap: 30,
      axisLabel: {
        color: ChartTheme.base.neutralGray,
        formatter: (value: number) => (xAxisFormatter ? xAxisFormatter(value) : `${value}`)
      },
      axisLine: { lineStyle: { color: '#000', width: 2 } },
      splitLine: {
        show: true,
        lineStyle: {
          color: '#F8FAFC',
          type: 'solid'
        }
      }
    },
    yAxis: {
      type: 'value',
      name: yAxisLabel,
      nameLocation: 'middle',
      nameGap: 50,
      axisLabel: {
        color: ChartTheme.base.neutralGray,
        formatter: (value: number) => (yAxisFormatter ? yAxisFormatter(value) : `${value}`)
      },
      axisLine: { lineStyle: { color: '#000', width: 2 } },
      splitLine: {
        show: true,
        lineStyle: {
          color: '#F8FAFC',
          type: 'solid'
        }
      }
    },
    series: chartType === 'line'
      ? [
          {
            name: title || 'Line',
            type: 'line',
            data: lineData,
            smooth: smooth,
            lineStyle: {
              color: lineColor,
              width: 2,
              type: 'solid',
            },
            itemStyle: {
              color: lineColor,
              borderWidth: 3,
              borderColor: '#fff',
            },
            symbol: 'circle',
            symbolSize: 8,
          }
        ]
      : [
          {
            name: title || 'Scatter',
            type: 'scatter',
            data: scatterData,
            symbolSize: (data: any[]) => {
              return data[2] ? Math.max(10, Math.min(30, data[2] * 2)) : 12;
            },
            itemStyle: {
              color: ChartTheme.base.primaryBlue,
              opacity: 0.8
            },
            emphasis: {
              itemStyle: {
                borderColor: '#ffffff',
                borderWidth: 2,
                shadowBlur: 10,
                shadowColor: 'rgba(0, 0, 0, 0.3)'
              }
            },
            markLine: markLine
          }
        ],
    grid: {
      left: '10%',
      right: '10%',
      bottom: '15%',
      top: '10%',
      containLabel: true
    }
  };

  return (
    <ChartContainer title={title} className={className} height={height}>
      <ReactECharts option={option} style={{ height: '100%', width: '100%' }} />
    </ChartContainer>
  );
};

export default ScatterPlot;
