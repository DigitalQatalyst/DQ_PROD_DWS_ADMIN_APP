import React from 'react';
import Icon from '../../../components/ui/AppIcon';

interface FunnelChartProps {
  data: {
    stage: string;
    value: number;
    percentage: number;
    color: string;
  }[];
  title?: string;
  description?: string;
  className?: string;
}

const FunnelChart: React.FC<FunnelChartProps> = ({ data, title, description, className = '' }) => {
  const maxValue = Math.max(...data.map(d => d.value));
  
  return (
    <div className={`bg-white border border-border rounded-xl p-6 ${className}`}>
      {(title || description) && (
        <div className="mb-6">
          {title && (
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                <Icon name="TrendingDown" size={16} className="text-blue-600" />
              </div>
              <h4 className="text-lg font-semibold text-foreground">{title}</h4>
            </div>
          )}
          {description && (
            <p className="text-sm text-muted-foreground ml-11">{description}</p>
          )}
        </div>
      )}
      
      <div className="space-y-4">
        {data.map((item, index) => {
          const width = (item.value / maxValue) * 100;
          const height = 40;
          
          return (
            <div key={index} className="relative">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-foreground">{item.stage}</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-foreground">{item.value.toLocaleString()}</span>
                  <span className="text-xs text-muted-foreground">({item.percentage}%)</span>
                </div>
              </div>
              
              <div className="relative">
                <div 
                  className="h-10 rounded-lg flex items-center justify-end pr-4 transition-all duration-300 hover:opacity-80"
                  style={{ 
                    width: `${width}%`,
                    backgroundColor: item.color,
                    backgroundImage: `linear-gradient(135deg, ${item.color} 0%, ${item.color}dd 100%)`
                  }}
                >
                  <span className="text-white text-sm font-medium">
                    {item.percentage}%
                  </span>
                </div>
                
                {/* Funnel effect - trapezoid shape */}
                <div 
                  className="absolute top-0 left-0 h-10 border-l-4 border-transparent"
                  style={{
                    borderLeftColor: item.color,
                    borderTopWidth: '20px',
                    borderBottomWidth: '20px',
                    borderTopColor: 'transparent',
                    borderBottomColor: 'transparent'
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Summary */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Conversion Rate</span>
          <span className="text-sm font-semibold text-emerald-600">
            {((data[data.length - 1]?.value / data[0]?.value) * 100).toFixed(1)}%
          </span>
        </div>
      </div>
    </div>
  );
};

export default FunnelChart;
