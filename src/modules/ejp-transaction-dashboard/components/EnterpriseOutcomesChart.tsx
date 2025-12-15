import React from 'react';
import Icon from '../../../components/ui/AppIcon';

interface EnterpriseOutcomesChartProps {
  data: {
    csatScore: number;
    engagementRate: number;
    revenueGenerated: number;
    serviceROI: number;
  };
  description?: string;
}

const EnterpriseOutcomesChart: React.FC<EnterpriseOutcomesChartProps> = ({ data, description }) => {
  // Mock data for visualizations
  const csatData = [4.2, 4.3, 4.4, 4.5, 4.5, 4.6, 4.7, 4.8, 4.9, 5.0, 4.8, 4.7];
  const engagementData = [80, 82, 84, 85, 86, 87.4, 88, 90, 91, 92, 93, 94];
  const revenueData = [1.8, 2.0, 2.1, 2.2, 2.3, 2.45, 2.6, 2.7, 2.8, 2.9, 3.0, 3.1];
  const roiData = [
    { category: 'Investment', value: 150 },
    { category: 'Returns', value: 450 }
  ];

  return (
    <div className="bg-white border border-border rounded-xl p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-lg font-medium text-foreground">Enterprise Outcomes & Impact Analytics</h4>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Icon name="TrendingUp" size={14} />
            <span>Impact Metrics</span>
          </div>
        </div>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 12. Customer Satisfaction Score (CSAT) - KPI Bar Chart */}
        <div className="space-y-4">
          <h5 className="text-sm font-medium text-foreground mb-3">Customer Satisfaction Score (CSAT)</h5>
          <div className="bg-gray-50 rounded-lg p-4 h-64">
            <div className="h-full flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <span className="text-2xl font-bold text-yellow-600">{data.csatScore}/5.0</span>
                <span className="text-sm text-gray-600">CSAT score</span>
              </div>
              <div className="flex-1 flex items-end justify-between">
                {csatData.map((value, index) => (
                  <div key={index} className="flex flex-col items-center">
                    <div 
                      className="bg-yellow-500 rounded-t w-8 mb-2"
                      style={{ height: `${(value / 5.0) * 120}px` }}
                    ></div>
                    <span className="text-xs text-gray-500">Q{index + 1}</span>
                  </div>
                ))}
              </div>
              <div className="mt-2 text-xs text-gray-600 text-center">
                KPI Bar Chart - Measures customer satisfaction based on feedback
              </div>
            </div>
          </div>
        </div>
        
        {/* 13. Product Engagement Rate - KPI Line/Bar Chart */}
        <div className="space-y-4">
          <h5 className="text-sm font-medium text-foreground mb-3">Product Engagement Rate</h5>
          <div className="bg-gray-50 rounded-lg p-4 h-64">
            <div className="h-full flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <span className="text-2xl font-bold text-blue-600">{data.engagementRate}%</span>
                <span className="text-sm text-gray-600">engagement</span>
              </div>
              <div className="flex-1 relative">
                <svg width="100%" height="100%" className="absolute inset-0">
                  <path
                    d={`M 0,${100 - (engagementData[0] / Math.max(...engagementData)) * 100} 
                        L ${20},${100 - (engagementData[1] / Math.max(...engagementData)) * 100}
                        L ${40},${100 - (engagementData[2] / Math.max(...engagementData)) * 100}
                        L ${60},${100 - (engagementData[3] / Math.max(...engagementData)) * 100}
                        L ${80},${100 - (engagementData[4] / Math.max(...engagementData)) * 100}
                        L 100,${100 - (engagementData[5] / Math.max(...engagementData)) * 100}`}
                    stroke="#3B82F6"
                    strokeWidth="3"
                    fill="none"
                  />
                  {engagementData.map((value, index) => (
                    <circle
                      key={index}
                      cx={`${index * 20}`}
                      cy={`${100 - (value / Math.max(...engagementData)) * 100}`}
                      r="4"
                      fill="#3B82F6"
                    />
                  ))}
                </svg>
              </div>
              <div className="mt-2 text-xs text-gray-600 text-center">
                KPI Line/Bar Chart - Indicates how actively enterprises are engaging with the product
              </div>
            </div>
          </div>
        </div>
        
        {/* 14. Revenue Generated via EJP Channel - Line Chart */}
        <div className="space-y-4">
          <h5 className="text-sm font-medium text-foreground mb-3">Revenue Generated via EJP Channel</h5>
          <div className="bg-gray-50 rounded-lg p-4 h-64">
            <div className="h-full flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <span className="text-2xl font-bold text-green-600">£{(data.revenueGenerated / 1000000).toFixed(1)}M</span>
                <span className="text-sm text-gray-600">revenue</span>
              </div>
              <div className="flex-1 relative">
                <svg width="100%" height="100%" className="absolute inset-0">
                  <path
                    d={`M 0,${100 - (revenueData[0] / Math.max(...revenueData)) * 100} 
                        L ${20},${100 - (revenueData[1] / Math.max(...revenueData)) * 100}
                        L ${40},${100 - (revenueData[2] / Math.max(...revenueData)) * 100}
                        L ${60},${100 - (revenueData[3] / Math.max(...revenueData)) * 100}
                        L ${80},${100 - (revenueData[4] / Math.max(...revenueData)) * 100}
                        L 100,${100 - (revenueData[5] / Math.max(...revenueData)) * 100}`}
                    stroke="#10B981"
                    strokeWidth="3"
                    fill="none"
                  />
                  {revenueData.map((value, index) => (
                    <circle
                      key={index}
                      cx={`${index * 20}`}
                      cy={`${100 - (value / Math.max(...revenueData)) * 100}`}
                      r="4"
                      fill="#10B981"
                    />
                  ))}
                </svg>
              </div>
              <div className="mt-2 text-xs text-gray-600 text-center">
                Line Chart - Tracks the revenue generation from transactions through the EJP channel
              </div>
            </div>
          </div>
        </div>
        
        {/* 15. Service ROI (Return on Investment) - Donut Chart */}
        <div className="space-y-4">
          <h5 className="text-sm font-medium text-foreground mb-3">Service ROI (Return on Investment)</h5>
          <div className="bg-gray-50 rounded-lg p-4 h-64">
            <div className="h-full flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <span className="text-2xl font-bold text-purple-600">{data.serviceROI}%</span>
                <span className="text-sm text-gray-600">ROI</span>
              </div>
              <div className="flex-1 flex items-center justify-center">
                <div className="relative w-32 h-32">
                  <svg width="128" height="128" className="transform -rotate-90">
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      stroke="#E5E7EB"
                      strokeWidth="8"
                      fill="none"
                    />
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      stroke="#8B5CF6"
                      strokeWidth="8"
                      fill="none"
                      strokeDasharray={`${2 * Math.PI * 56}`}
                      strokeDashoffset={`${2 * Math.PI * 56 * (1 - data.serviceROI / 400)}`}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-lg font-bold text-purple-600">{data.serviceROI}%</span>
                  </div>
                </div>
              </div>
              <div className="mt-2 text-xs text-gray-600 text-center">
                Donut Chart - Calculates the return on investment for the service
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Impact Summary */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">{data.csatScore}/5.0</div>
            <div className="text-xs text-gray-600">CSAT Score</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{data.engagementRate}%</div>
            <div className="text-xs text-gray-600">Engagement Rate</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">£{(data.revenueGenerated / 1000000).toFixed(1)}M</div>
            <div className="text-xs text-gray-600">Revenue Generated</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{data.serviceROI}%</div>
            <div className="text-xs text-gray-600">Service ROI</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnterpriseOutcomesChart;
