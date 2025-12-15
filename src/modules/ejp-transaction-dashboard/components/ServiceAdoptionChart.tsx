import React from 'react';
import Icon from '../../../components/ui/AppIcon';

interface ServiceAdoptionChartProps {
  data: {
    totalEnterprises: number;
    newOnboardings: number;
    activeAccounts: number;
    subscriptionRate: number;
    usageFrequency: number;
    retentionRate: number;
  };
}

const ServiceAdoptionChart: React.FC<ServiceAdoptionChartProps> = ({ data }) => {
  // Mock data for visualizations
  const enterpriseEngagementData = [1200, 1250, 1300, 1350, 1400, 1450, 1470, 1485, 1495, 1500, 1510, 1525];
  const onboardingData = [
    { month: 'Jan', new: 45, returning: 12 },
    { month: 'Feb', new: 52, returning: 15 },
    { month: 'Mar', new: 48, returning: 18 },
    { month: 'Apr', new: 61, returning: 22 },
    { month: 'May', new: 55, returning: 25 },
    { month: 'Jun', new: 68, returning: 28 },
    { month: 'Jul', new: 62, returning: 30 },
    { month: 'Aug', new: 71, returning: 32 },
    { month: 'Sep', new: 65, returning: 28 },
    { month: 'Oct', new: 73, returning: 35 },
    { month: 'Nov', new: 69, returning: 33 },
    { month: 'Dec', new: 89, returning: 38 }
  ];
  const activeAccountsData = [1100, 1150, 1180, 1200, 1220, 1234, 1250, 1265, 1280, 1300, 1320, 1340];
  const usageFrequencyData = [
    { enterprise: 'Enterprise A', frequency: 4.2 },
    { enterprise: 'Enterprise B', frequency: 3.8 },
    { enterprise: 'Enterprise C', frequency: 5.1 },
    { enterprise: 'Enterprise D', frequency: 2.9 },
    { enterprise: 'Enterprise E', frequency: 4.7 },
    { enterprise: 'Enterprise F', frequency: 3.5 },
    { enterprise: 'Enterprise G', frequency: 4.9 },
    { enterprise: 'Enterprise H', frequency: 4.1 },
    { enterprise: 'Enterprise I', frequency: 3.9 },
    { enterprise: 'Enterprise J', frequency: 5.3 }
  ];

  return (
    <div className="bg-white border border-border rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h4 className="text-lg font-medium text-foreground">Service Adoption & Reach Analytics</h4>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Icon name="TrendingUp" size={14} />
          <span>Live Data</span>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 1. Total Number of Enterprises Engaged - KPI Line/Bar Chart */}
        <div className="space-y-4">
          <h5 className="text-sm font-medium text-foreground mb-3">Total Number of Enterprises Engaged</h5>
          <div className="bg-gray-50 rounded-lg p-4 h-64">
            <div className="h-full flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <span className="text-2xl font-bold text-blue-600">{data.totalEnterprises.toLocaleString()}</span>
                <span className="text-sm text-gray-600">enterprises</span>
              </div>
              <div className="flex-1 flex items-end justify-between">
                {enterpriseEngagementData.map((value, index) => (
                  <div key={index} className="flex flex-col items-center">
                    <div 
                      className="bg-blue-500 rounded-t w-8 mb-2"
                      style={{ height: `${(value / Math.max(...enterpriseEngagementData)) * 120}px` }}
                    ></div>
                    <span className="text-xs text-gray-500">Q{index + 1}</span>
                  </div>
                ))}
              </div>
              <div className="mt-2 text-xs text-gray-600 text-center">
                KPI Line/Bar Chart - Measures total engagement level with the service across enterprises
              </div>
            </div>
          </div>
        </div>
        
        {/* 2. New Enterprise Onboardings - Stacked Bar Chart */}
        <div className="space-y-4">
          <h5 className="text-sm font-medium text-foreground mb-3">New Enterprise Onboardings</h5>
          <div className="bg-gray-50 rounded-lg p-4 h-64">
            <div className="h-full flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <span className="text-2xl font-bold text-green-600">{data.newOnboardings}</span>
                <span className="text-sm text-gray-600">this month</span>
              </div>
              <div className="flex-1 flex items-end justify-between">
                {onboardingData.map((item, index) => (
                  <div key={index} className="flex flex-col items-center w-12">
                    <div className="w-full flex flex-col items-center">
                      <div 
                        className="bg-green-500 w-full mb-1"
                        style={{ height: `${(item.new / Math.max(...onboardingData.map(d => d.new))) * 80}px` }}
                      ></div>
                      <div 
                        className="bg-green-300 w-full"
                        style={{ height: `${(item.returning / Math.max(...onboardingData.map(d => d.returning))) * 40}px` }}
                      ></div>
                    </div>
                    <span className="text-xs text-gray-500 mt-1">{item.month}</span>
                  </div>
                ))}
              </div>
              <div className="mt-2 text-xs text-gray-600 text-center">
                Stacked Bar Chart - Tracks new onboarding of enterprises for the service over time
              </div>
            </div>
          </div>
        </div>
        
        {/* 3. Active Enterprise Accounts - Area Chart */}
        <div className="space-y-4">
          <h5 className="text-sm font-medium text-foreground mb-3">Active Enterprise Accounts</h5>
          <div className="bg-gray-50 rounded-lg p-4 h-64">
            <div className="h-full flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <span className="text-2xl font-bold text-purple-600">{data.activeAccounts.toLocaleString()}</span>
                <span className="text-sm text-gray-600">accounts</span>
              </div>
              <div className="flex-1 relative">
                <svg width="100%" height="100%" className="absolute inset-0">
                  <defs>
                    <linearGradient id="activeGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.8"/>
                      <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.1"/>
                    </linearGradient>
                  </defs>
                  <path
                    d={`M 0,${100 - (activeAccountsData[0] / Math.max(...activeAccountsData)) * 100} 
                        L ${20},${100 - (activeAccountsData[1] / Math.max(...activeAccountsData)) * 100}
                        L ${40},${100 - (activeAccountsData[2] / Math.max(...activeAccountsData)) * 100}
                        L ${60},${100 - (activeAccountsData[3] / Math.max(...activeAccountsData)) * 100}
                        L ${80},${100 - (activeAccountsData[4] / Math.max(...activeAccountsData)) * 100}
                        L 100,${100 - (activeAccountsData[5] / Math.max(...activeAccountsData)) * 100}
                        L 100,100 L 0,100 Z`}
                    fill="url(#activeGradient)"
                  />
                  <path
                    d={`M 0,${100 - (activeAccountsData[0] / Math.max(...activeAccountsData)) * 100} 
                        L ${20},${100 - (activeAccountsData[1] / Math.max(...activeAccountsData)) * 100}
                        L ${40},${100 - (activeAccountsData[2] / Math.max(...activeAccountsData)) * 100}
                        L ${60},${100 - (activeAccountsData[3] / Math.max(...activeAccountsData)) * 100}
                        L ${80},${100 - (activeAccountsData[4] / Math.max(...activeAccountsData)) * 100}
                        L 100,${100 - (activeAccountsData[5] / Math.max(...activeAccountsData)) * 100}`}
                    stroke="#8B5CF6"
                    strokeWidth="2"
                    fill="none"
                  />
                </svg>
              </div>
              <div className="mt-2 text-xs text-gray-600 text-center">
                Area Chart - Indicates how many enterprises are currently utilizing the service
              </div>
            </div>
          </div>
        </div>
        
        {/* 4. Service Subscription / Activation Rate - KPI Pie Chart */}
        <div className="space-y-4">
          <h5 className="text-sm font-medium text-foreground mb-3">Service Subscription / Activation Rate</h5>
          <div className="bg-gray-50 rounded-lg p-4 h-64">
            <div className="h-full flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <span className="text-2xl font-bold text-orange-600">{data.subscriptionRate}%</span>
                <span className="text-sm text-gray-600">activation rate</span>
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
                      stroke="#F97316"
                      strokeWidth="8"
                      fill="none"
                      strokeDasharray={`${2 * Math.PI * 56}`}
                      strokeDashoffset={`${2 * Math.PI * 56 * (1 - data.subscriptionRate / 100)}`}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-lg font-bold text-orange-600">{data.subscriptionRate}%</span>
                  </div>
                </div>
              </div>
              <div className="mt-2 text-xs text-gray-600 text-center">
                KPI Pie Chart - Displays the activation success rate of referred enterprises
              </div>
            </div>
          </div>
        </div>
        
        {/* 5. Service Usage Frequency - Heatmap */}
        <div className="space-y-4">
          <h5 className="text-sm font-medium text-foreground mb-3">Service Usage Frequency</h5>
          <div className="bg-gray-50 rounded-lg p-4 h-64">
            <div className="h-full flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <span className="text-2xl font-bold text-indigo-600">{data.usageFrequency}</span>
                <span className="text-sm text-gray-600">times/month</span>
              </div>
              <div className="flex-1 grid grid-cols-5 gap-1">
                {usageFrequencyData.map((item, index) => (
                  <div key={index} className="flex flex-col items-center">
                    <div 
                      className="w-full rounded"
                      style={{ 
                        height: `${(item.frequency / Math.max(...usageFrequencyData.map(d => d.frequency))) * 60}px`,
                        backgroundColor: `hsl(${240 - (item.frequency / Math.max(...usageFrequencyData.map(d => d.frequency))) * 120}, 70%, 50%)`
                      }}
                    ></div>
                    <span className="text-xs text-gray-500 mt-1">{item.enterprise}</span>
                  </div>
                ))}
              </div>
              <div className="mt-2 text-xs text-gray-600 text-center">
                Heatmap - Visualizes the frequency of service usage by active enterprises
              </div>
            </div>
          </div>
        </div>
        
        {/* 6. Enterprise Retention Rate - Funnel Chart */}
        <div className="space-y-4">
          <h5 className="text-sm font-medium text-foreground mb-3">Enterprise Retention Rate</h5>
          <div className="bg-gray-50 rounded-lg p-4 h-64">
            <div className="h-full flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <span className="text-2xl font-bold text-emerald-600">{data.retentionRate}%</span>
                <span className="text-sm text-gray-600">retention rate</span>
              </div>
              <div className="flex-1 flex flex-col justify-center items-center space-y-2">
                <div className="w-3/4 bg-emerald-200 h-8 rounded flex items-center justify-center">
                  <span className="text-sm font-medium text-emerald-800">Total Enterprises</span>
                </div>
                <div className="w-2/3 bg-emerald-300 h-8 rounded flex items-center justify-center">
                  <span className="text-sm font-medium text-emerald-800">Active Users</span>
                </div>
                <div className="w-1/2 bg-emerald-400 h-8 rounded flex items-center justify-center">
                  <span className="text-sm font-medium text-emerald-800">Retained Users</span>
                </div>
              </div>
              <div className="mt-2 text-xs text-gray-600 text-center">
                Funnel Chart - Represents the rate at which enterprises continue using the service
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceAdoptionChart;
