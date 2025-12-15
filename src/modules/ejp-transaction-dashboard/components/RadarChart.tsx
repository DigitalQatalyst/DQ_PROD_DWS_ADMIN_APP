import React from 'react';
import Icon from '../../../components/ui/AppIcon';

interface RadarChartProps {
  data: {
    metric: string;
    value: number;
    maxValue: number;
    color?: string;
  }[];
  title?: string;
  description?: string;
  className?: string;
  size?: number;
}

const RadarChart: React.FC<RadarChartProps> = ({ 
  data, 
  title, 
  description,
  className = '',
  size = 300
}) => {
  const centerX = size / 2;
  const centerY = size / 2;
  const radius = (size - 60) / 2;
  
  // Generate polygon points
  const generatePolygonPoints = (values: number[]) => {
    return values.map((value, index) => {
      const angle = (index * 2 * Math.PI) / values.length - Math.PI / 2;
      const x = centerX + (value * radius * Math.cos(angle));
      const y = centerY + (value * radius * Math.sin(angle));
      return `${x},${y}`;
    }).join(' ');
  };
  
  // Generate grid circles
  const generateGridCircles = () => {
    const circles = [];
    for (let i = 1; i <= 5; i++) {
      const r = (radius * i) / 5;
      circles.push(
        <circle
          key={i}
          cx={centerX}
          cy={centerY}
          r={r}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth="1"
        />
      );
    }
    return circles;
  };
  
  // Generate axis lines
  const generateAxisLines = () => {
    return data.map((_, index) => {
      const angle = (index * 2 * Math.PI) / data.length - Math.PI / 2;
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);
      return (
        <line
          key={index}
          x1={centerX}
          y1={centerY}
          x2={x}
          y2={y}
          stroke="#e5e7eb"
          strokeWidth="1"
        />
      );
    });
  };
  
  // Generate metric labels
  const generateMetricLabels = () => {
    return data.map((item, index) => {
      const angle = (index * 2 * Math.PI) / data.length - Math.PI / 2;
      const labelRadius = radius + 20;
      const x = centerX + labelRadius * Math.cos(angle);
      const y = centerY + labelRadius * Math.sin(angle);
      
      return (
        <text
          key={index}
          x={x}
          y={y}
          textAnchor="middle"
          dominantBaseline="middle"
          className="text-xs font-medium fill-gray-600"
        >
          {item.metric}
        </text>
      );
    });
  };
  
  // Generate value labels
  const generateValueLabels = () => {
    return data.map((item, index) => {
      const angle = (index * 2 * Math.PI) / data.length - Math.PI / 2;
      const valueRadius = radius + 35;
      const x = centerX + valueRadius * Math.cos(angle);
      const y = centerY + valueRadius * Math.sin(angle);
      
      return (
        <text
          key={index}
          x={x}
          y={y}
          textAnchor="middle"
          dominantBaseline="middle"
          className="text-xs font-semibold fill-blue-600"
        >
          {item.value}
        </text>
      );
    });
  };
  
  const normalizedValues = data.map(item => item.value / item.maxValue);
  const polygonPoints = generatePolygonPoints(normalizedValues);
  
  return (
    <div className={`bg-white border border-border rounded-xl p-6 ${className}`}>
      {(title || description) && (
        <div className="mb-6">
          {title && (
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center">
                <Icon name="Target" size={16} className="text-purple-600" />
              </div>
              <h4 className="text-lg font-semibold text-foreground">{title}</h4>
            </div>
          )}
          {description && (
            <p className="text-sm text-muted-foreground ml-11">{description}</p>
          )}
        </div>
      )}
      
      <div className="flex flex-col items-center">
        <svg width={size} height={size} className="mb-4">
          {/* Grid circles */}
          {generateGridCircles()}
          
          {/* Axis lines */}
          {generateAxisLines()}
          
          {/* Data polygon */}
          <polygon
            points={polygonPoints}
            fill="rgba(59, 130, 246, 0.2)"
            stroke="rgb(59, 130, 246)"
            strokeWidth="2"
            className="transition-all duration-300 hover:fill-opacity-30"
          />
          
          {/* Data points */}
          {normalizedValues.map((value, index) => {
            const angle = (index * 2 * Math.PI) / data.length - Math.PI / 2;
            const x = centerX + (value * radius * Math.cos(angle));
            const y = centerY + (value * radius * Math.sin(angle));
            
            return (
              <circle
                key={index}
                cx={x}
                cy={y}
                r="4"
                fill="rgb(59, 130, 246)"
                className="transition-all duration-200 hover:r-6"
              />
            );
          })}
          
          {/* Metric labels */}
          {generateMetricLabels()}
          
          {/* Value labels */}
          {generateValueLabels()}
        </svg>
        
        {/* Legend */}
        <div className="grid grid-cols-2 gap-4 text-xs">
          {data.map((item, index) => (
            <div key={index} className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <span className="text-muted-foreground">{item.metric}:</span>
              <span className="font-semibold text-foreground">{item.value}/{item.maxValue}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RadarChart;
