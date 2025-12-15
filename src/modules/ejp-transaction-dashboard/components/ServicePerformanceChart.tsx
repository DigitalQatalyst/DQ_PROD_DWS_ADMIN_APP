import React from 'react';
import Icon from '../../../components/ui/AppIcon';

interface ServicePerformanceChartProps {
  data: {
    avgDeliveryTime: number;
    successRate: number;
    supportTickets: number;
    systemUptime: number;
    errorRate: number;
  };
  description?: string;
}

const ServicePerformanceChart: React.FC<ServicePerformanceChartProps> = ({ data, description }) => {

  return (
    <div className="bg-white border border-border rounded-xl p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-lg font-medium text-foreground">Service Performance & Delivery Quality Analytics</h4>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Icon name="Target" size={14} />
            <span>Performance Metrics</span>
          </div>
        </div>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      
      
      {/* Performance Summary */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{data.avgDeliveryTime} days</div>
            <div className="text-xs text-gray-600">Avg Delivery Time</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{data.successRate}%</div>
            <div className="text-xs text-gray-600">Success Rate</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{data.systemUptime}%</div>
            <div className="text-xs text-gray-600">System Uptime</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{data.errorRate}%</div>
            <div className="text-xs text-gray-600">Error Rate</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServicePerformanceChart;
