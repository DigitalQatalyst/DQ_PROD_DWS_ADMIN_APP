import React from 'react';
import Icon from '../../../components/ui/AppIcon';
import { KPICardProps } from '../../../types';

interface ExtendedKPICardProps extends KPICardProps {
  sparklineData?: number[];
  threshold?: 'excellent' | 'good' | 'normal' | 'warning' | 'critical';
  targetStatus?: 'achieved' | 'approaching' | 'on-track' | 'at-risk' | 'critical';
}

const KPICard: React.FC<ExtendedKPICardProps> = ({ 
  title, 
  value, 
  unit = '', 
  trend, 
  trendValue, 
  sparklineData = [], 
  threshold = 'normal',
  description,
  icon,
  target,
  targetStatus = 'on-track'
}) => {
  // Threshold-based coloring
  const getThresholdColor = () => {
    switch (threshold) {
      case 'excellent':
        return 'border-emerald-300 bg-white text-emerald-900';
      case 'good':
        return 'border-green-300 bg-white text-green-900';
      case 'warning':
        return 'border-yellow-300 bg-white text-yellow-900';
      case 'critical':
        return 'border-red-300 bg-white text-red-900';
      default:
        return 'border-gray-300 bg-white text-gray-900';
    }
  };

  const getTrendColor = () => {
    return trend === 'up' ? 'text-emerald-600' : trend === 'down' ? 'text-red-600' : 'text-gray-500';
  };

  const getIconBgColor = () => {
    switch (threshold) {
      case 'excellent':
        return 'bg-emerald-50 text-emerald-600';
      case 'good':
        return 'bg-green-50 text-green-600';
      case 'warning':
        return 'bg-yellow-50 text-yellow-600';
      case 'critical':
        return 'bg-red-50 text-red-600';
      default:
        return 'bg-gray-50 text-gray-600';
    }
  };

  const getTargetStatusColor = () => {
    switch (targetStatus) {
      case 'achieved':
      case 'approaching':
      case 'on-track':
        return 'text-emerald-700 bg-emerald-50 border border-emerald-200';
      case 'at-risk':
      case 'critical':
        return 'text-red-700 bg-red-50 border border-red-200';
      default:
        return 'text-gray-700 bg-gray-50 border border-gray-200';
    }
  };

  const getTrendBadgeColor = () => {
    if (trend === 'up') {
      return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
    } else if (trend === 'down') {
      return 'bg-red-50 text-red-700 border border-red-200';
    }
    return 'bg-gray-50 text-gray-700 border border-gray-200';
  };

  const generateSparklinePath = () => {
    if (!sparklineData?.length) return '';
    
    const width = 70;
    const height = 20;
    const max = Math.max(...sparklineData);
    const min = Math.min(...sparklineData);
    const range = max - min || 1;
    
    return sparklineData?.map((value, index) => {
        const x = (index / (sparklineData?.length - 1)) * width;
        const y = height - ((value - min) / range) * height;
        return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
      })?.join(' ');
  };

  const getSparklineColor = () => {
    switch (threshold) {
      case 'excellent':
        return 'text-emerald-500';
      case 'good':
        return 'text-green-500';
      case 'warning':
        return 'text-yellow-500';
      case 'critical':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  return (
    <div className={`p-6 rounded-xl border shadow-sm transition-all duration-200 hover:shadow-md ${getThresholdColor()}`}>
      {/* Header with Icon and Sparkline */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          {icon && (
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getIconBgColor()} flex-shrink-0`}>
              <Icon name={icon} size={18} />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-sm leading-5">{title}</h3>
          </div>
        </div>
        
        {/* Sparkline */}
        {sparklineData?.length > 0 && (
          <div className="w-16 h-5 ml-2 flex-shrink-0">
            <svg width="70" height="20" className="overflow-visible">
              {/* Main line */}
              <path
                d={generateSparklinePath()}
                stroke="currentColor"
                strokeWidth="1.5"
                fill="none"
                className={`${getSparklineColor()}`}
              />
              
              {/* End point */}
              {sparklineData?.length > 0 && (
                <circle
                  cx="70"
                  cy={20 - ((sparklineData?.[sparklineData?.length - 1] - Math.min(...sparklineData)) / (Math.max(...sparklineData) - Math.min(...sparklineData) || 1)) * 20}
                  r="2"
                  className={`${getSparklineColor()}`}
                  fill="currentColor"
                />
              )}
            </svg>
          </div>
        )}
      </div>
      
      {/* Main Value Display */}
      <div className="space-y-3">
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-light tracking-tight">
            {value}
          </span>
          {unit && (
            <span className="text-sm text-gray-600 font-medium">
              {unit}
            </span>
          )}
        </div>
        
        {/* Trend and Target Column */}
        <div className="space-y-2">
          {/* Trend Badge */}
          {trend && trendValue && (
            <div className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${getTrendBadgeColor()}`}>
              <Icon 
                name={trend === 'up' ? 'TrendingUp' : trend === 'down' ? 'TrendingDown' : 'Minus'} 
                size={12} 
              />
              <span>{trendValue}</span>
            </div>
          )}
          
          {/* Target Status Badge */}
          {target && (
            <div className={`px-2 py-1 rounded text-xs font-medium ${getTargetStatusColor()}`}>
              Target: {target}
            </div>
          )}
        </div>
        
        {/* Description */}
        {description && (
          <p className="text-xs text-gray-600 leading-4">
            {description}
          </p>
        )}
      </div>
    </div>
  );
};

export default KPICard;




