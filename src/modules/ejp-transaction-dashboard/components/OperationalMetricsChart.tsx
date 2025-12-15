import React from 'react';
import Icon from '../../../components/ui/AppIcon';

interface OperationalMetricsChartProps {
  data: {
    supportVolume: number;
    resolutionTime: number;
    slaBreaches: number;
    riskAlerts: number;
  };
  description?: string;
}

const OperationalMetricsChart: React.FC<OperationalMetricsChartProps> = ({ data, description }) => {
  // Mock data for visualizations
  const supportVolumeData = [180, 175, 170, 165, 160, 156, 150, 145, 140, 135, 130, 125];
  const resolutionTimeData = [3.2, 3.0, 2.8, 2.6, 2.5, 2.4, 2.3, 2.2, 2.1, 2.0, 1.9, 1.8];
  const slaBreachData = [8, 7, 6, 5, 4, 3, 2, 1, 0, 1, 2, 3];
  const riskAlertData = [
    { severity: 'High', count: 2, impact: 8 },
    { severity: 'Medium', count: 3, impact: 5 },
    { severity: 'Low', count: 2, impact: 3 },
    { severity: 'High', count: 4, impact: 9 },
    { severity: 'Medium', count: 5, impact: 6 },
    { severity: 'Low', count: 3, impact: 4 }
  ];

  return (
    <div className="bg-white border border-border rounded-xl p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-lg font-medium text-foreground">Operational & Risk Metrics Analytics</h4>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Icon name="AlertTriangle" size={14} />
            <span>Risk & Operations</span>
          </div>
        </div>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 16. Support Ticket Volume - Area Chart */}
        <div className="space-y-4">
          <h5 className="text-sm font-medium text-foreground mb-3">Support Ticket Volume</h5>
          <div className="bg-gray-50 rounded-lg p-4 h-64">
            <div className="h-full flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <span className="text-2xl font-bold text-blue-600">{data.supportVolume}</span>
                <span className="text-sm text-gray-600">tickets</span>
              </div>
              <div className="flex-1 relative">
                <svg width="100%" height="100%" className="absolute inset-0">
                  <defs>
                    <linearGradient id="supportGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.8"/>
                      <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.1"/>
                    </linearGradient>
                  </defs>
                  <path
                    d={`M 0,${100 - (supportVolumeData[0] / Math.max(...supportVolumeData)) * 100} 
                        L ${20},${100 - (supportVolumeData[1] / Math.max(...supportVolumeData)) * 100}
                        L ${40},${100 - (supportVolumeData[2] / Math.max(...supportVolumeData)) * 100}
                        L ${60},${100 - (supportVolumeData[3] / Math.max(...supportVolumeData)) * 100}
                        L ${80},${100 - (supportVolumeData[4] / Math.max(...supportVolumeData)) * 100}
                        L 100,${100 - (supportVolumeData[5] / Math.max(...supportVolumeData)) * 100}
                        L 100,100 L 0,100 Z`}
                    fill="url(#supportGradient)"
                  />
                  <path
                    d={`M 0,${100 - (supportVolumeData[0] / Math.max(...supportVolumeData)) * 100} 
                        L ${20},${100 - (supportVolumeData[1] / Math.max(...supportVolumeData)) * 100}
                        L ${40},${100 - (supportVolumeData[2] / Math.max(...supportVolumeData)) * 100}
                        L ${60},${100 - (supportVolumeData[3] / Math.max(...supportVolumeData)) * 100}
                        L ${80},${100 - (supportVolumeData[4] / Math.max(...supportVolumeData)) * 100}
                        L 100,${100 - (supportVolumeData[5] / Math.max(...supportVolumeData)) * 100}`}
                    stroke="#3B82F6"
                    strokeWidth="2"
                    fill="none"
                  />
                </svg>
              </div>
              <div className="mt-2 text-xs text-gray-600 text-center">
                Area Chart - Represents the volume of support tickets across service areas
              </div>
            </div>
          </div>
        </div>
        
        {/* 17. Ticket Resolution Time - Line Chart */}
        <div className="space-y-4">
          <h5 className="text-sm font-medium text-foreground mb-3">Ticket Resolution Time</h5>
          <div className="bg-gray-50 rounded-lg p-4 h-64">
            <div className="h-full flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <span className="text-2xl font-bold text-green-600">{data.resolutionTime}h</span>
                <span className="text-sm text-gray-600">avg time</span>
              </div>
              <div className="flex-1 relative">
                <svg width="100%" height="100%" className="absolute inset-0">
                  <path
                    d={`M 0,${100 - (resolutionTimeData[0] / Math.max(...resolutionTimeData)) * 100} 
                        L ${20},${100 - (resolutionTimeData[1] / Math.max(...resolutionTimeData)) * 100}
                        L ${40},${100 - (resolutionTimeData[2] / Math.max(...resolutionTimeData)) * 100}
                        L ${60},${100 - (resolutionTimeData[3] / Math.max(...resolutionTimeData)) * 100}
                        L ${80},${100 - (resolutionTimeData[4] / Math.max(...resolutionTimeData)) * 100}
                        L 100,${100 - (resolutionTimeData[5] / Math.max(...resolutionTimeData)) * 100}`}
                    stroke="#10B981"
                    strokeWidth="3"
                    fill="none"
                  />
                  {resolutionTimeData.map((value, index) => (
                    <circle
                      key={index}
                      cx={`${index * 20}`}
                      cy={`${100 - (value / Math.max(...resolutionTimeData)) * 100}`}
                      r="4"
                      fill="#10B981"
                    />
                  ))}
                </svg>
              </div>
              <div className="mt-2 text-xs text-gray-600 text-center">
                Line Chart - Measures the average resolution time for support tickets
              </div>
            </div>
          </div>
        </div>
        
        {/* 18. SLA Breach Alerts - Column Chart */}
        <div className="space-y-4">
          <h5 className="text-sm font-medium text-foreground mb-3">SLA Breach Alerts</h5>
          <div className="bg-gray-50 rounded-lg p-4 h-64">
            <div className="h-full flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <span className="text-2xl font-bold text-red-600">{data.slaBreaches}</span>
                <span className="text-sm text-gray-600">breaches</span>
              </div>
              <div className="flex-1 flex items-end justify-between">
                {slaBreachData.map((value, index) => (
                  <div key={index} className="flex flex-col items-center">
                    <div 
                      className="bg-red-500 rounded-t w-8 mb-2"
                      style={{ height: `${(value / Math.max(...slaBreachData)) * 120}px` }}
                    ></div>
                    <span className="text-xs text-gray-500">Q{index + 1}</span>
                  </div>
                ))}
              </div>
              <div className="mt-2 text-xs text-gray-600 text-center">
                Column Chart - Displays breaches in the Service Level Agreement (SLA) and their frequency
              </div>
            </div>
          </div>
        </div>
        
        {/* 19. Risk Alerts (Breaches) - Bubble Chart */}
        <div className="space-y-4">
          <h5 className="text-sm font-medium text-foreground mb-3">Risk Alerts (Breaches)</h5>
          <div className="bg-gray-50 rounded-lg p-4 h-64">
            <div className="h-full flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <span className="text-2xl font-bold text-orange-600">{data.riskAlerts}</span>
                <span className="text-sm text-gray-600">alerts</span>
              </div>
              <div className="flex-1 flex items-center justify-center">
                <div className="w-full h-full relative">
                  <svg width="100%" height="100%" className="absolute inset-0">
                    {riskAlertData.map((item, index) => (
                      <circle
                        key={index}
                        cx={`${30 + index * 20}%`}
                        cy={`${50 + (Math.random() - 0.5) * 20}%`}
                        r={`${item.impact * 3 + 5}`}
                        fill={`hsl(${item.severity === 'High' ? 0 : item.severity === 'Medium' ? 30 : 60}, 70%, 50%)`}
                        opacity="0.7"
                      />
                    ))}
                  </svg>
                  <div className="absolute bottom-4 left-4 text-xs text-gray-600">
                    Bubble Chart - Monitors the risk levels and alerts on potential breaches in service
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Operational Summary */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{data.supportVolume}</div>
            <div className="text-xs text-gray-600">Support Tickets</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{data.resolutionTime}h</div>
            <div className="text-xs text-gray-600">Avg Resolution Time</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{data.slaBreaches}</div>
            <div className="text-xs text-gray-600">SLA Breaches</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">{data.riskAlerts}</div>
            <div className="text-xs text-gray-600">Risk Alerts</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OperationalMetricsChart;
