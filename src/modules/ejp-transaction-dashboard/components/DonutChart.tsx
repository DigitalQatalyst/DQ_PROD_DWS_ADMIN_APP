import React from 'react';
import Icon from '../../../components/ui/AppIcon';

interface DonutChartProps {
  data: {
    label: string;
    value: number;
    color: string;
    percentage: number;
  }[];
  title?: string;
  description?: string;
  className?: string;
  size?: number;
  showLegend?: boolean;
  showCenterText?: boolean;
  centerText?: string;
  centerSubtext?: string;
}

const DonutChart: React.FC<DonutChartProps> = ({ 
  data, 
  title, 
  description,
  className = '',
  size = 200,
  showLegend = true,
  showCenterText = true,
  centerText,
  centerSubtext
}) => {
  const centerX = size / 2;
  const centerY = size / 2;
  const radius = (size - 40) / 2;
  const innerRadius = radius * 0.6;
  
  // Calculate total value
  const total = data.reduce((sum, item) => sum + item.value, 0);
  
  // Generate SVG path for each segment
  const generateSegmentPath = (startAngle: number, endAngle: number, isInner: boolean = false) => {
    const r = isInner ? innerRadius : radius;
    const startX = centerX + r * Math.cos(startAngle);
    const startY = centerY + r * Math.sin(startAngle);
    const endX = centerX + r * Math.cos(endAngle);
    const endY = centerY + r * Math.sin(endAngle);
    
    const largeArcFlag = endAngle - startAngle <= Math.PI ? 0 : 1;
    
    return [
      `M ${startX} ${startY}`,
      `A ${r} ${r} 0 ${largeArcFlag} 1 ${endX} ${endY}`,
      `L ${centerX + innerRadius * Math.cos(endAngle)} ${centerY + innerRadius * Math.sin(endAngle)}`,
      `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${centerX + innerRadius * Math.cos(startAngle)} ${centerY + innerRadius * Math.sin(startAngle)}`,
      'Z'
    ].join(' ');
  };
  
  // Generate segments
  let currentAngle = -Math.PI / 2; // Start from top
  
  const segments = data.map((item, index) => {
    const angle = (item.value / total) * 2 * Math.PI;
    const startAngle = currentAngle;
    const endAngle = currentAngle + angle;
    
    const segment = {
      ...item,
      startAngle,
      endAngle,
      path: generateSegmentPath(startAngle, endAngle)
    };
    
    currentAngle = endAngle;
    return segment;
  });
  
  return (
    <div className={`bg-white border border-border rounded-xl p-6 ${className}`}>
      {(title || description) && (
        <div className="mb-6">
          {title && (
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center">
                <Icon name="PieChart" size={16} className="text-green-600" />
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
        <div className="relative">
          <svg width={size} height={size} className="transform -rotate-90">
            {segments.map((segment, index) => (
              <path
                key={index}
                d={segment.path}
                fill={segment.color}
                className="transition-all duration-300 hover:opacity-80 cursor-pointer"
                style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' }}
              />
            ))}
          </svg>
          
          {/* Center text */}
          {showCenterText && (
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="text-center">
                {centerText && (
                  <div className="text-2xl font-bold text-foreground">
                    {centerText}
                  </div>
                )}
                {centerSubtext && (
                  <div className="text-sm text-muted-foreground">
                    {centerSubtext}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        
        {/* Legend */}
        {showLegend && (
          <div className="mt-6 space-y-2 w-full">
            {data.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: item.color }}
                  ></div>
                  <span className="text-sm text-muted-foreground">{item.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-foreground">
                    {item.value.toLocaleString()}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    ({item.percentage}%)
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DonutChart;
