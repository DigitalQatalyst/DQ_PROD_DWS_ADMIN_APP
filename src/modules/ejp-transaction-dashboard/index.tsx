import { useState, useEffect } from 'react';
import KPICard from './components/KPICard';
import EnterpriseOutcomesChart from './components/EnterpriseOutcomesChart';
import OperationalMetricsChart from './components/OperationalMetricsChart';
import RealTimeAlerts from './components/RealTimeAlerts';
import FunnelChart from './components/FunnelChart';
import HeatmapChart from './components/HeatmapChart';
import RadarChart from './components/RadarChart';
import DonutChart from './components/DonutChart';
import ScatterPlot from './components/ScatterPlot';
import DeliverySuccessCombo from './components/DeliverySuccessCombo';
import TicketsStackedBar from './components/TicketsStackedBar';
import TicketVolumeMA from './components/TicketVolumeMA';
import CSATTrend from './components/CSATTrend';
import FirstResponseTime from './components/FirstResponseTime';
import ErrorRateHeatmap from './components/ErrorRateHeatmap';
import GaugeChart from './components/GaugeChart';
// New ShadCN UI chart components
import ClusteredBarChart from './components/ClusteredBarChart';
import LineChartWithRange from './components/LineChartWithRange';
import BarChartWithGradient from './components/BarChartWithGradient';
import StackedBarChart from './components/StackedBarChart';
import ComboLineChart from './components/ComboLineChart';
import LineChartWithTrend from './components/LineChartWithTrend';
import AlertPanel from './components/AlertPanel';
import ChartTheme from './components/ChartTheme';
import Icon from '../../components/ui/AppIcon';
import Button from '../../components/ui/Button';
import Select from '../../components/ui/Select';
import DataService, { DashboardData } from '../../backend/lib/dataService';
// import DataService, { DashboardData } from '../../lib/dataService';

const EJPTransactionDashboard = () => {
  const [topLevelTab, setTopLevelTab] = useState('operations');
  const [activeTab, setActiveTab] = useState('service-adoption');
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [isRealTimeActive, setIsRealTimeActive] = useState(true);
  const [alerts] = useState([
    {
      id: 1,
      type: 'warning',
      title: 'High Drop-off Rate',
      message: 'Enquiry drop-off rate increased to 18%',
      timestamp: new Date(Date.now() - 5 * 60 * 1000),
      severity: 'medium'
    },
    {
      id: 2,
      type: 'info',
      title: 'Activation Spike',
      message: 'Service activation rate reached 85%',
      timestamp: new Date(Date.now() - 10 * 60 * 1000),
      severity: 'low'
    }
  ]);

  // Global filters
  const [globalFilters, setGlobalFilters] = useState({
    dateRange: 'this-week',
    serviceCategory: 'all',
    subServiceType: 'all',
    region: 'all',
    enterpriseSize: 'all'
  });

  // Data loaded via DataService (replaces hardcoded arrays)
  const [loadedData, setLoadedData] = useState<DashboardData | null>(null);
  // Uptime trend controls
  const [uptimePeriod, setUptimePeriod] = useState('7d');

  useEffect(() => {
    let isMounted = true;
    // Normalize keys to expected service filters
    const serviceFilters = {
      dateRange: (globalFilters.dateRange as any).replace(/\s/g, '-') as any,
      serviceCategory: globalFilters.serviceCategory as any,
      subServiceType: globalFilters.subServiceType as any,
      region: globalFilters.region as any,
      enterpriseSize: (globalFilters.enterpriseSize as any).replace(/\s.*/, '') as any,
    } as any;
    DataService.fetchDashboardData(serviceFilters).then((resp) => {
      if (isMounted) setLoadedData(resp);
    });
    return () => { isMounted = false; };
  }, [globalFilters]);

  // Apply filters to loaded datasets (Service Type / Sub-Service Type)
  const filteredData = loadedData;

  // Top-level tab configuration
  const topLevelTabs = [
    { id: 'market', label: 'Market', icon: 'TrendingUp' },
    { id: 'strategic', label: 'Strategic', icon: 'Target' },
    { id: 'operations', label: 'Operations', icon: 'Settings' }
  ];

  // Tab configuration
  const dashboardTabs = [
    { id: 'service-adoption', label: 'Service Enquiry & Reach', icon: 'Users' },
    { id: 'service-performance', label: 'Service Performance & Delivery Quality', icon: 'Target' },
    { id: 'enterprise-outcomes', label: 'Enterprise Outcomes & Impact', icon: 'TrendingUp' },
    { id: 'operational-risk', label: 'Operational & Risk Metrics', icon: 'AlertTriangle' }
  ];

  // Filter options
  const filterOptions = {
    dateRange: [
      { value: 'this-week', label: 'This Week' },
      { value: 'last-week', label: 'Last Week' },
      { value: 'this-quarter', label: 'This Quarter' },
      { value: 'this-year', label: 'This Year' }
    ],
    serviceCategory: [
      { value: 'all', label: 'All Types' },
      { value: 'financial', label: 'Financial' },
      { value: 'non-financial', label: 'Non Financial' }
    ],
    subServiceType: [
      { value: 'all', label: 'All Sub-Services' },
      { value: 'onboarding', label: 'Enquiry' },
      { value: 'activation', label: 'Activation' },
      { value: 'advisory', label: 'Advisory' },
      { value: 'training', label: 'Training' }
    ],
    region: [
      { value: 'all', label: 'All Regions' },
      { value: 'uae', label: 'UAE' },
      { value: 'gcc', label: 'GCC' },
      { value: 'mena', label: 'MENA' },
      { value: 'global', label: 'Global' }
    ],
    enterpriseSize: [
      { value: 'all', label: 'All Sizes' },
      { value: 'micro', label: 'Micro (1-5 employees)' },
      { value: 'small', label: 'Small (6-50 employees)' },
      { value: 'medium', label: 'Medium (51-250 employees)' },
      { value: 'large', label: 'Large (250+ employees)' }
    ]
  };

  // Update global filters
  const updateGlobalFilter = (filterKey: string, value: string) => {
    setGlobalFilters(prev => ({
      ...prev,
      [filterKey]: value
    }));
  };

  // Clear all filters
  const clearAllFilters = () => {
    setGlobalFilters({
      dateRange: 'this-week',
      serviceCategory: 'all',
      subServiceType: 'all',
      region: 'all',
      enterpriseSize: 'all'
    });
  };

  // Check if any filters are active
  const hasActiveFilters = () => {
    return globalFilters.dateRange !== 'this-week' ||
      globalFilters.serviceCategory !== 'all' ||
      globalFilters.subServiceType !== 'all' ||
      globalFilters.region !== 'all' ||
      globalFilters.enterpriseSize !== 'all';
  };

  // Get filter label for display
  const getFilterLabel = (filterKey: string, value: string) => {
    const options = filterOptions[filterKey as keyof typeof filterOptions];
    const option = options?.find((opt: any) => opt.value === value);
    return option?.label || value;
  };

  const formatLastUpdated = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;

    return date?.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Service Enquiry & Reach Metrics (1-4) - Based on Table Metrics
  const serviceAdoptionMetrics = loadedData?.serviceAdoptionMetrics ?? [];

  // Service Performance & Delivery Quality Metrics (7-11) - Based on Table Metrics
  const servicePerformanceMetrics = loadedData?.servicePerformanceMetrics ?? [];

  // Enterprise Outcomes & Impact Metrics (12-14, 19-24) - Based on Table Metrics
  const enterpriseOutcomesMetrics = loadedData?.enterpriseOutcomesMetrics ?? [];

  // Operational & Risk Metrics (15-18) - Based on Table Metrics
  const operationalMetrics = loadedData?.operationalMetrics ?? [];

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Page Header */}
      <div className="px-4 sm:px-6 pt-4 pb-4 bg-white border-b border-gray-200">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
          <div className="space-y-3">
            {topLevelTab === 'operations' && (
              <>
                <h1 className="text-4xl font-light text-foreground tracking-tight">
                  Service Provider Operations Dashboard (EJP Transactions)
                </h1>
                <p className="text-base text-muted-foreground max-w-4xl leading-relaxed">
                  Track and analyze service provider operations for EJP Transactions with real-time metrics,
                  service enquiry insights, performance indicators, and enterprise outcomes for strategic decision-making.
                </p>
              </>
            )}

            {topLevelTab === 'market' && (
              <>
                <h1 className="text-4xl font-light text-foreground tracking-tight">
                  Market Analytics Dashboard
                </h1>
                <p className="text-base text-muted-foreground max-w-4xl leading-relaxed">
                  Comprehensive market intelligence and competitive analysis for EJP Transaction services,
                  including market trends, customer segments, and growth opportunities.
                </p>
              </>
            )}

            {topLevelTab === 'strategic' && (
              <>
                <h1 className="text-4xl font-light text-foreground tracking-tight">
                  Strategic Planning Dashboard
                </h1>
                <p className="text-base text-muted-foreground max-w-4xl leading-relaxed">
                  Executive-level insights and strategic planning tools for EJP Transaction services,
                  including business performance, strategic initiatives, and long-term planning metrics.
                </p>
              </>
            )}
          </div>

          {/* Real-time Status */}
          <div className="flex flex-col items-end gap-3">
            <button
              onClick={() => setIsRealTimeActive(!isRealTimeActive)}
              className={`flex items-center gap-3 px-4 py-3 border rounded-xl transition-all duration-200 hover:shadow-md ${isRealTimeActive ?
                'bg-blue-50 border-blue-200 hover:bg-blue-100' : 'bg-card border-border hover:bg-gray-50'
                }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${isRealTimeActive ? 'bg-blue-500 animate-pulse' : 'bg-gray-400'}`} />
                <div className="flex flex-col">
                  <span className={`text-xs font-medium ${isRealTimeActive ? 'text-blue-900' : 'text-card-foreground'}`}>
                    {isRealTimeActive ? 'Analytics Live' : 'Updates Paused'}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Updated {formatLastUpdated(lastUpdated)}
                  </span>
                </div>
              </div>
              <Icon
                name={isRealTimeActive ? 'Pause' : 'Play'}
                size={14}
                className={`${isRealTimeActive ? 'text-blue-700' : 'text-gray-600'} hover:scale-110 transition-transform`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Top-Level Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-4 sm:px-6">
          <div className="flex items-center justify-center">
            {topLevelTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setTopLevelTab(tab.id)}
                className={`relative flex-1 px-4 sm:px-8 py-3 text-xs sm:text-sm font-medium whitespace-nowrap transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${topLevelTab === tab.id ?
                  'text-blue-600 bg-blue-50 border-b-2 border-blue-500' :
                  'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                  }`}
                tabIndex={0}
                role="tab"
                aria-selected={topLevelTab === tab.id}
                aria-controls={`top-level-${tab.id}`}
              >
                <div className="flex items-center gap-2 justify-center">
                  <Icon name={tab.icon} size={16} />
                  <span>{tab.label}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Dashboard Tabs - Operations active; Market/Strategic show TBU placeholders */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-4 sm:px-6">
          <div className="flex items-center justify-center">
            {topLevelTab === 'operations'
              ? (
                dashboardTabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`relative flex-1 px-3 sm:px-8 py-3 text-xs sm:text-sm font-medium whitespace-nowrap transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${activeTab === tab.id ?
                      'text-blue-600 bg-blue-50 border-b-2 border-blue-500' :
                      'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                      }`}
                    tabIndex={0}
                    role="tab"
                    aria-selected={activeTab === tab.id}
                    aria-controls={`dashboard-${tab.id}`}
                  >
                    <div className="flex items-center gap-2 justify-center">
                      <Icon name={tab.icon} size={14} />
                      <span className="hidden sm:inline">{tab.label}</span>
                      <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
                    </div>
                  </button>
                ))
              ) : (
                dashboardTabs.map((tab) => (
                  <button
                    key={tab.id}
                    className={
                      'relative flex-1 px-3 sm:px-8 py-3 text-xs sm:text-sm font-medium whitespace-nowrap text-gray-400 bg-gray-50 cursor-not-allowed border-b-2 border-transparent'
                    }
                    aria-disabled="true"
                    role="tab"
                  >
                    <div className="flex items-center gap-2 justify-center">
                      <Icon name={tab.icon} size={14} />
                      <span>TBU</span>
                    </div>
                  </button>
                ))
              )}
          </div>
        </div>
      </div>

      {topLevelTab === 'operations' && (
        <main className="pb-12 px-4 sm:px-6 pt-6">
          {/* Global Filters */}
          <div className="mb-8">
            <div className="bg-white border border-border rounded-xl p-6">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Icon name="Calendar" size={16} className="text-blue-600" />
                      <span className="text-sm font-semibold text-foreground">Date Range</span>
                    </div>
                    <Select
                      value={globalFilters.dateRange}
                      onChange={(value) => updateGlobalFilter('dateRange', String(value))}
                      options={filterOptions.dateRange}
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Icon name="Filter" size={16} className="text-green-600" />
                      <span className="text-sm font-semibold text-foreground">Service Type</span>
                    </div>
                    <Select
                      value={globalFilters.serviceCategory}
                      onChange={(value) => updateGlobalFilter('serviceCategory', String(value))}
                      options={filterOptions.serviceCategory}
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Icon name="Layers" size={16} className="text-purple-600" />
                      <span className="text-sm font-semibold text-foreground">Sub-Service Type</span>
                    </div>
                    <Select
                      value={globalFilters.subServiceType}
                      onChange={(value) => updateGlobalFilter('subServiceType', String(value))}
                      options={filterOptions.subServiceType}
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Icon name="MapPin" size={16} className="text-orange-600" />
                      <span className="text-sm font-semibold text-foreground">Region</span>
                    </div>
                    <Select
                      value={globalFilters.region}
                      onChange={(value) => updateGlobalFilter('region', String(value))}
                      options={filterOptions.region}
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Icon name="Building" size={16} className="text-indigo-600" />
                      <span className="text-sm font-semibold text-foreground">Enterprise Size</span>
                    </div>
                    <Select
                      value={globalFilters.enterpriseSize}
                      onChange={(value) => updateGlobalFilter('enterpriseSize', String(value))}
                      options={filterOptions.enterpriseSize}
                      className="w-full"
                    />
                  </div>
                </div>

                {/* Active Filter Tags */}
                {hasActiveFilters() && (
                  <div className="mt-6 pt-4 border-t border-gray-200">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Icon name="Tag" size={14} className="text-gray-500" />
                        <span className="text-sm font-medium text-gray-700">Active Filters:</span>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={clearAllFilters}
                        className="text-xs"
                      >
                        <Icon name="X" size={14} className="mr-1" />
                        Clear All
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {globalFilters.dateRange !== 'this-month' && (
                        <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-full px-3 py-1">
                          <Icon name="Calendar" size={12} className="text-blue-600" />
                          <span className="text-xs font-medium text-blue-800">
                            {getFilterLabel('dateRange', globalFilters.dateRange)}
                          </span>
                          <button
                            onClick={() => updateGlobalFilter('dateRange', 'this-month')}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <Icon name="X" size={10} />
                          </button>
                        </div>
                      )}

                      {globalFilters.serviceCategory !== 'all' && (
                        <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-full px-3 py-1">
                          <Icon name="Filter" size={12} className="text-green-600" />
                          <span className="text-xs font-medium text-green-800">
                            {getFilterLabel('serviceCategory', globalFilters.serviceCategory)}
                          </span>
                          <button
                            onClick={() => updateGlobalFilter('serviceCategory', 'all')}
                            className="text-green-600 hover:text-green-800"
                          >
                            <Icon name="X" size={10} />
                          </button>
                        </div>
                      )}

                      {globalFilters.subServiceType !== 'all' && (
                        <div className="flex items-center gap-2 bg-purple-50 border border-purple-200 rounded-full px-3 py-1">
                          <Icon name="Layers" size={12} className="text-purple-600" />
                          <span className="text-xs font-medium text-purple-800">
                            {getFilterLabel('subServiceType', globalFilters.subServiceType)}
                          </span>
                          <button
                            onClick={() => updateGlobalFilter('subServiceType', 'all')}
                            className="text-purple-600 hover:text-purple-800"
                          >
                            <Icon name="X" size={10} />
                          </button>
                        </div>
                      )}

                      {globalFilters.region !== 'all' && (
                        <div className="flex items-center gap-2 bg-orange-50 border border-orange-200 rounded-full px-3 py-1">
                          <Icon name="MapPin" size={12} className="text-orange-600" />
                          <span className="text-xs font-medium text-orange-800">
                            {getFilterLabel('region', globalFilters.region)}
                          </span>
                          <button
                            onClick={() => updateGlobalFilter('region', 'all')}
                            className="text-orange-600 hover:text-orange-800"
                          >
                            <Icon name="X" size={10} />
                          </button>
                        </div>
                      )}

                      {globalFilters.enterpriseSize !== 'all' && (
                        <div className="flex items-center gap-2 bg-indigo-50 border border-indigo-200 rounded-full px-3 py-1">
                          <Icon name="Building" size={12} className="text-indigo-600" />
                          <span className="text-xs font-medium text-indigo-800">
                            {getFilterLabel('enterpriseSize', globalFilters.enterpriseSize)}
                          </span>
                          <button
                            onClick={() => updateGlobalFilter('enterpriseSize', 'all')}
                            className="text-indigo-600 hover:text-indigo-800"
                          >
                            <Icon name="X" size={10} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Dashboard Content */}
          {activeTab === 'service-adoption' && (
            <div className="space-y-8">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-1 h-12 rounded-full" style={{ backgroundColor: ChartTheme.base.primaryBlue }}></div>
                <div className="flex-1">
                  <h3 className="text-2xl font-light text-foreground mb-2">Service Enquiry & Reach Headlines</h3>
                  <p className="text-sm text-muted-foreground">
                    Key metrics tracking total engaged enterprises, activation rates, usage patterns, and retention across EJP Transaction services
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {serviceAdoptionMetrics.map((metric, index) => (
                  <KPICard
                    key={index}
                    title={metric.title}
                    value={metric.value}
                    unit={metric.unit}
                    trend={metric.trend}
                    trendValue={metric.trendValue}
                    threshold={metric.threshold}
                    description={metric.description}
                    icon={metric.icon}
                    sparklineData={metric.sparklineData}
                    target={metric.target}
                  />
                ))}
              </div>

              {/* Service Activation and Enquiry Performance Section */}
              <div className="mt-12">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-1 h-12 rounded-full" style={{ backgroundColor: ChartTheme.base.primaryBlue }}></div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-light text-foreground mb-2">Service Enquiry and Activation Performance</h3>
                    <p className="text-sm text-muted-foreground">
                      Service activation and enquiry performance metrics showing conversion rates and enterprise engagement
                    </p>
                  </div>
                </div>

                {/* Top Section - Clustered Bar Chart + Alert Panel */}
                <div className="grid grid-cols-1 xl:grid-cols-7 gap-6 mb-8">
                  {/* Clustered Bar Chart */}
                  <div className="xl:col-span-5">
                    <ClusteredBarChart
                      title="Enquiry & Activation"
                      description="Tracks how efficiently enterprises complete enquiries and activate services over a selected time period, highlighting conversion effectiveness across touchpoints."
                      data={filteredData?.onboardingActivation ?? []}
                      height="h-80"
                    />
                  </div>

                  {/* Alert Panel */}
                  <div className="xl:col-span-2">
                    <AlertPanel
                      title="Alerts"
                      description="Real-time alerts for critical changes in enquiry and activation metrics with severity indicators."
                      alerts={[
                        {
                          title: 'Activation Rate dropped −3 pts below target',
                          date: 'Sep 15',
                          context: 'Down from 60% → 57%',
                          severity: 'high'
                        },
                        {
                          title: 'Avg. Time to Activation spiked to 2.1 days',
                          date: 'Sep 20',
                          context: 'Highest in 3 months',
                          severity: 'medium'
                        },
                        {
                          title: 'Enquiry Stability maintained',
                          date: 'Sep 22',
                          context: 'Flat trend',
                          severity: 'low'
                        }
                      ]}
                    />
                  </div>
                </div>

                {/* Middle Section - Two Charts */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
                  {/* Time to Activation Line Chart */}
                  <LineChartWithRange
                    title="Time to Activation"
                    description="Measures the average days taken from service signup to first active use, indicating the speed and efficiency of enterprise activation."
                    data={filteredData?.timeToActivation ?? []}
                    height="h-64"
                    insightText="Lowest in Aug: 1.3d; Sep up to 2.1d (+0.8d)"
                    insightMonth="Aug"
                  />

                  {/* Drop-off Rate During Enquiry Bar Chart */}
                  <BarChartWithGradient
                    title="Drop-off Rate During Enquiry"
                    description="Shows the percentage of enterprises abandoning the enquiry process, helping identify friction points that reduce activation success."
                    data={filteredData?.dropoff ?? []}
                    height="h-64"
                    thresholds={{ low: 10, moderate: 15 }}
                  />
                </div>
              </div>

              {/* Service Usage and Loyalty Section */}
              <div className="mt-12">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-1 h-12 rounded-full" style={{ backgroundColor: ChartTheme.base.primaryBlue }}></div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-light text-foreground mb-2">Service Usage and Loyalty</h3>
                    <p className="text-sm text-muted-foreground">
                      Enterprise usage patterns, frequency analysis, and retention metrics across different service categories
                    </p>
                  </div>
                </div>

                {/* Row 1 - Two Charts Side by Side */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                  {/* Chart A - Active User Rate */}
                  <LineChartWithTrend
                    title="Active User Rate"
                    description="Monitors the proportion of enterprises actively using services month-to-month, reflecting platform adoption and sustained engagement."
                    data={filteredData?.activeUserRate ?? []}
                    height="h-80"
                    ariaDescription="Monthly active user rate with bars and 3-month trendline."
                  />

                  {/* Chart B - Repeat Usage Rate */}
                  <StackedBarChart
                    title="Repeat Usage Rate"
                    description="Breaks down repeat versus first-time users to reveal behavioral loyalty and the success of re-engagement strategies."
                    data={filteredData?.repeatUsage ?? []}
                    height="h-80"
                    ariaDescription="Stacked bars showing monthly first-time and repeat users, total usage, and proportion of repeats."
                  />
                </div>

                {/* Row 2 - Churn & Retention Over Time */}
                <ComboLineChart
                  title="Churn & Retention Over Time"
                  description="Combines churn and retention trends to highlight customer stability, early warning signals, and long-term enterprise loyalty performance."
                  data={filteredData?.churnRetention ?? []}
                  height="h-96"
                  ariaDescription="Dual-axis view of monthly churn and retention rates with moving averages."
                />
              </div>
            </div>
          )}

          {activeTab === 'service-performance' && (
            <div className="space-y-8">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-1 h-12 rounded-full bg-green-500"></div>
                <div className="flex-1">
                  <h3 className="text-2xl font-light text-foreground mb-2">Service Performance & Delivery Quality</h3>
                  <p className="text-sm text-muted-foreground">
                    Service delivery performance metrics: SLA compliance, resolution time, success rate, and customer satisfaction for EJP Transactions
                  </p>
                </div>
              </div>

              {/* KPI headline grid - Service Delivery KPIs */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <KPICard
                  title="SLA Compliance Rate"
                  value="98.5"
                  unit="%"
                  trend="up"
                  trendValue="+0.8%"
                  threshold="excellent"
                  description="Percentage of services delivered within the agreed SLA."
                  icon="CheckCircle"
                  sparklineData={[97.2, 97.5, 97.8, 98.0, 98.2, 98.5]}
                  target="≥ 98%"
                />
                <KPICard
                  title="Average Resolution Time"
                  value="2.2"
                  unit="hours"
                  trend="down"
                  trendValue="-0.3"
                  threshold="excellent"
                  description="Average time to resolve service-related issues."
                  icon="Clock"
                  sparklineData={[2.8, 2.7, 2.6, 2.5, 2.4, 2.2]}
                  target="≤ 2.5 hours"
                />
                <KPICard
                  title="Service Success Rate"
                  value="99.2"
                  unit="%"
                  trend="up"
                  trendValue="+0.5%"
                  threshold="excellent"
                  description="Percentage of successful service transactions out of all service requests."
                  icon="Target"
                  sparklineData={[98.2, 98.4, 98.6, 98.8, 99.0, 99.2]}
                  target="≥ 99%"
                />
                <KPICard
                  title="Customer Satisfaction Index (CSAT)"
                  value="91.3"
                  unit="%"
                  trend="up"
                  trendValue="+1.5%"
                  threshold="excellent"
                  description="Average satisfaction score from enterprise feedback after service completion."
                  icon="ThumbsUp"
                  sparklineData={[88.5, 89.0, 89.5, 90.0, 90.5, 91.3]}
                  target="≥ 90%"
                />
              </div>

              {/* Section: Service Efficiency & Response Time */}
              <div className="mt-12">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-1 h-12 rounded-full bg-green-500"></div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-light text-foreground mb-2">Service Efficiency & Response Time</h3>
                    <p className="text-sm text-muted-foreground">Speed and responsiveness: delivery time, ticket resolution, first-time resolution, and escalations.</p>
                  </div>
                </div>

                {/* Top Section - Delivery Success Combo Chart + Alert Panel */}
                <div className="grid grid-cols-1 xl:grid-cols-7 gap-6 mb-8">
                  {/* Delivery Success Combo Chart */}
                  <div className="xl:col-span-5">
                    <DeliverySuccessCombo
                      data={[
                        { month: 'Jan', avgDeliveryDays: 3.2, successRate: 99.7 },
                        { month: 'Feb', avgDeliveryDays: 3.0, successRate: 99.5 },
                        { month: 'Mar', avgDeliveryDays: 3.1, successRate: 99.6 },
                        { month: 'Apr', avgDeliveryDays: 3.4, successRate: 99.8 },
                        { month: 'May', avgDeliveryDays: 3.5, successRate: 99.7 },
                        { month: 'Jun', avgDeliveryDays: 3.0, successRate: 99.6 },
                      ]}
                    />
                  </div>

                  {/* Performance Monitoring Alert Panel */}
                  <div className="xl:col-span-2">
                    <AlertPanel
                      title="Alerts"
                      description="Real-time alerts for changes in service response time, ticket resolution, and first-time resolution rate, with severity indicators."
                      alerts={[
                        // High Priority Alerts (Top)
                        {
                          title: 'Response Time Exceeded SLA Target by 0.5 hours',
                          date: 'Oct 22',
                          context: 'Response time exceeded the SLA by 0.5 hours, reaching 3.2 hours. Potential SLA breach.',
                          severity: 'high'
                        },
                        {
                          title: 'High-Priority Ticket Resolution Time Increased by 25%',
                          date: 'Oct 21',
                          context: 'High-priority ticket resolution time increased by 25%, reaching 3.1 hours, exceeding the target.',
                          severity: 'high'
                        },
                        {
                          title: 'Advisory Service FTR Dropped to 85%',
                          date: 'Oct 23',
                          context: 'First-time resolution rate (FTR) for Advisory service dropped below target, falling to 85%.',
                          severity: 'high'
                        },
                        // Medium Priority Alerts (Middle)
                        {
                          title: 'SLA Compliance Dropped 2% Below Target',
                          date: 'Oct 19',
                          context: 'SLA compliance dropped from 98% to 96%, impacting response times.',
                          severity: 'medium'
                        },
                        {
                          title: 'Medium Priority Ticket Resolution Dropped by 10%',
                          date: 'Oct 18',
                          context: 'Medium-priority tickets saw a 10% drop in resolution rate, requiring attention.',
                          severity: 'medium'
                        },
                        {
                          title: 'First-Time Resolution Rate for Training Dropped to 88%',
                          date: 'Oct 20',
                          context: 'Training service FTR decreased from 90% to 88%, slightly below target.',
                          severity: 'medium'
                        },
                        // Low Priority Alerts (Bottom)
                        {
                          title: 'SLA Compliance Maintained at 98%',
                          date: 'Oct 25',
                          context: 'SLA compliance remained at 98%, indicating consistent performance.',
                          severity: 'low'
                        },
                        {
                          title: 'Low Priority Tickets Resolved Within Target Time',
                          date: 'Oct 22',
                          context: 'Low-priority tickets resolved on time, within the target 1.5 hours.',
                          severity: 'low'
                        },
                        {
                          title: 'Non-Financial Service FTR Maintained at 95%',
                          date: 'Oct 24',
                          context: 'Non-financial service maintained a high FTR rate of 95%.',
                          severity: 'low'
                        }
                      ]}
                    />
                  </div>
                </div>

                {/* Tickets Stacked Bar Chart */}
                <div className="grid grid-cols-1 xl:grid-cols-1 gap-6 mb-8">
                  <TicketsStackedBar
                    data={[
                      { month: 'Jan', volume: 156, resolved: 130 },
                      { month: 'Feb', volume: 140, resolved: 120 },
                      { month: 'Mar', volume: 130, resolved: 125 },
                      { month: 'Apr', volume: 120, resolved: 110 },
                      { month: 'May', volume: 150, resolved: 115 },
                      { month: 'Jun', volume: 160, resolved: 140 },
                    ]}
                  />
                </div>

                {/* Average Time to First Response */}
                <div className="grid grid-cols-1 xl:grid-cols-1 gap-6 mb-8">
                  <FirstResponseTime
                    data={[
                      { serviceType: 'Financial', avgHours: 3.1 },
                      { serviceType: 'Non-Financial', avgHours: 2.8 },
                      { serviceType: 'Advisory', avgHours: 3.5 },
                      { serviceType: 'Training', avgHours: 3.2 },
                    ]}
                    targetHours={4}
                    title="Service Response Time Analysis"
                    description="Average time from service request creation to first response by service team."
                    height="h-80"
                  />
                </div>
              </div>

              {/* Section: Service Quality & Reliability */}
              <div className="mt-12">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-1 h-12 rounded-full bg-green-500"></div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-light text-foreground mb-2">Service Quality & Reliability</h3>
                    <p className="text-sm text-muted-foreground">Service delivery performance and partner quality: compliance rates, rework tracking, fulfilment accuracy, resolution timeliness, and customer satisfaction.</p>
                  </div>
                </div>

                {/* Service Delivery Visualizations */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
                  <TicketVolumeMA
                    data={[
                      { date: '2025-10-01', high: 22, medium: 45, low: 30 },
                      { date: '2025-10-02', high: 18, medium: 48, low: 28 },
                      { date: '2025-10-03', high: 25, medium: 41, low: 27 },
                      { date: '2025-10-04', high: 21, medium: 39, low: 26 },
                      { date: '2025-10-05', high: 27, medium: 50, low: 34 },
                      { date: '2025-10-06', high: 23, medium: 47, low: 31 },
                      { date: '2025-10-07', high: 24, medium: 44, low: 29 },
                      { date: '2025-10-08', high: 26, medium: 46, low: 30 },
                      { date: '2025-10-09', high: 20, medium: 42, low: 26 },
                      { date: '2025-10-10', high: 19, medium: 40, low: 25 },
                      { date: '2025-10-11', high: 22, medium: 43, low: 24 },
                      { date: '2025-10-12', high: 24, medium: 41, low: 26 },
                      { date: '2025-10-13', high: 29, medium: 49, low: 31 },
                      { date: '2025-10-14', high: 28, medium: 47, low: 29 },
                    ]}
                  />
                  <ErrorRateHeatmap
                    data={[
                      { service: 'Financial', region: 'Global', errorRate: 1.2 },
                      { service: 'Non-Financial', region: 'Global', errorRate: 1.4 },
                      { service: 'Advisory', region: 'Global', errorRate: 1.1 },
                      { service: 'Training', region: 'Global', errorRate: 0.9 },
                      { service: 'Financial', region: 'MENA', errorRate: 0.8 },
                      { service: 'Non-Financial', region: 'MENA', errorRate: 0.9 },
                      { service: 'Advisory', region: 'MENA', errorRate: 0.7 },
                      { service: 'Training', region: 'MENA', errorRate: 0.6 },
                      { service: 'Financial', region: 'GCC', errorRate: 0.5 },
                      { service: 'Non-Financial', region: 'GCC', errorRate: 0.6 },
                      { service: 'Advisory', region: 'GCC', errorRate: 0.4 },
                      { service: 'Training', region: 'GCC', errorRate: 0.3 },
                      { service: 'Financial', region: 'UAE', errorRate: 0.3 },
                      { service: 'Non-Financial', region: 'UAE', errorRate: 0.4 },
                      { service: 'Advisory', region: 'UAE', errorRate: 0.2 },
                      { service: 'Training', region: 'UAE', errorRate: 0.1 },
                    ]}
                    title="Error Rate by Service & Region"
                    description="Error rates across services and regions with clear thresholds and outlier highlighting."
                    height="h-96"
                  />
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-1 gap-6">
                  <CSATTrend
                    data={[
                      { period: 'W1', csatPct: 88, responses: 85 },
                      { period: 'W2', csatPct: 91, responses: 92 },
                      { period: 'W3', csatPct: 89, responses: 78 },
                      { period: 'W4', csatPct: 92, responses: 95 },
                      { period: 'W5', csatPct: 90, responses: 88 },
                      { period: 'W6', csatPct: 93, responses: 102 },
                      { period: 'W7', csatPct: 89, responses: 82 },
                      { period: 'W8', csatPct: 94, responses: 108 },
                    ]}
                    csatTarget={90}
                    csatBandLow={85}
                    csatBandHigh={95}
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'enterprise-outcomes' && (
            <div className="space-y-8">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-1 h-12 rounded-full bg-purple-500"></div>
                <div className="flex-1">
                  <h3 className="text-2xl font-light text-foreground mb-2">Enterprise Outcomes & Impact</h3>
                  <p className="text-sm text-muted-foreground">
                    Impact metrics measuring customer satisfaction, revenue generation via EJP channels, and return on investment for service operations
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                {enterpriseOutcomesMetrics.map((metric, index) => (
                  <KPICard
                    key={index}
                    title={metric.title}
                    value={metric.value}
                    unit={metric.unit}
                    trend={metric.trend}
                    trendValue={metric.trendValue}
                    threshold={metric.threshold}
                    description={metric.description}
                    icon={metric.icon}
                    sparklineData={metric.sparklineData}
                    target={metric.target}
                  />
                ))}
              </div>

              {/* Enhanced Enterprise Outcomes Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <RadarChart
                  title="Digital Transformation Score"
                  description="Multi-dimensional assessment of digital transformation maturity across key capability areas"
                  data={[
                    { metric: 'Digital Adoption', value: 85, maxValue: 100 },
                    { metric: 'Process Automation', value: 78, maxValue: 100 },
                    { metric: 'Data Analytics', value: 92, maxValue: 100 },
                    { metric: 'Cloud Integration', value: 88, maxValue: 100 },
                    { metric: 'Security Compliance', value: 95, maxValue: 100 },
                    { metric: 'User Experience', value: 82, maxValue: 100 }
                  ]}
                />

                <DonutChart
                  title="Revenue Distribution by Channel"
                  description="Breakdown of total revenue generated across different sales and partner channels"
                  data={[
                    { label: 'EJP Channel', value: 2450000, color: '#3b82f6', percentage: 65 },
                    { label: 'Direct Sales', value: 980000, color: '#10b981', percentage: 26 },
                    { label: 'Partner Channel', value: 350000, color: '#f59e0b', percentage: 9 }
                  ]}
                  centerText="£3.78M"
                  centerSubtext="Total Revenue"
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <EnterpriseOutcomesChart
                  data={{ csatScore: 4.6, engagementRate: 88, revenueGenerated: 3780000, serviceROI: 120 }}
                  description="Comprehensive analytics tracking customer satisfaction, engagement, revenue impact, and return on investment"
                />

                <ScatterPlot
                  title="Customer Satisfaction vs Revenue Impact"
                  xAxisLabel="CSAT Score"
                  yAxisLabel="Revenue Growth (%)"
                  data={[
                    { x: 4.2, y: 12, label: 'Financial Services' },
                    { x: 4.6, y: 18, label: 'Non-Financial Services' },
                    { x: 4.4, y: 15, label: 'Advisory Services' },
                    { x: 4.8, y: 22, label: 'Training Services' },
                    { x: 4.5, y: 16, label: 'Support Services' },
                    { x: 4.7, y: 20, label: 'Consulting Services' }
                  ]}
                />
              </div>
            </div>
          )}

          {activeTab === 'operational-risk' && (
            <div className="space-y-8">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-1 h-12 rounded-full bg-red-500"></div>
                <div className="flex-1">
                  <h3 className="text-2xl font-light text-foreground mb-2">Operational & Risk Metrics</h3>
                  <p className="text-sm text-muted-foreground">
                    Operational metrics tracking support ticket volume, resolution times, escalation rates, and risk management for EJP Transaction services
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                {operationalMetrics.map((metric, index) => (
                  <KPICard
                    key={index}
                    title={metric.title}
                    value={metric.value}
                    unit={metric.unit}
                    trend={metric.trend}
                    trendValue={metric.trendValue}
                    threshold={metric.threshold}
                    description={metric.description}
                    icon={metric.icon}
                    sparklineData={metric.sparklineData}
                    target={metric.target}
                  />
                ))}
              </div>

              {/* Enhanced Operational Risk Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <FunnelChart
                  title="Ticket Resolution Funnel"
                  description="Visualizes the progressive reduction of support tickets through resolution stages, highlighting conversion rates"
                  data={[
                    { stage: 'Tickets Received', value: 156, percentage: 100, color: '#3b82f6' },
                    { stage: 'First Response', value: 142, percentage: 91, color: '#10b981' },
                    { stage: 'In Progress', value: 128, percentage: 82, color: '#f59e0b' },
                    { stage: 'Resolved', value: 118, percentage: 76, color: '#ef4444' }
                  ]}
                />

                <GaugeChart
                  title="First-Time Resolution Rate"
                  value={75.6}
                  maxValue={100}
                  unit="%"
                  thresholds={{ warning: 70, critical: 85 }}
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <OperationalMetricsChart
                  data={{ supportVolume: 156, resolutionTime: 2.1, slaBreaches: 4, riskAlerts: 7 } as any}
                  description="Comprehensive operational metrics tracking support volume, resolution times, SLA compliance, and risk alerts"
                />

                <HeatmapChart
                  title="SLA Breach Risk by Service & Region"
                  xAxisLabel="Service Category"
                  yAxisLabel="Region"
                  data={[
                    { x: 'Financial', y: 'UAE', value: 0.2 },
                    { x: 'Financial', y: 'GCC', value: 0.4 },
                    { x: 'Financial', y: 'MENA', value: 0.8 },
                    { x: 'Financial', y: 'Global', value: 1.2 },
                    { x: 'Non-Financial', y: 'UAE', value: 0.3 },
                    { x: 'Non-Financial', y: 'GCC', value: 0.5 },
                    { x: 'Non-Financial', y: 'MENA', value: 0.9 },
                    { x: 'Non-Financial', y: 'Global', value: 1.4 },
                    { x: 'Advisory', y: 'UAE', value: 0.1 },
                    { x: 'Advisory', y: 'GCC', value: 0.3 },
                    { x: 'Advisory', y: 'MENA', value: 0.6 },
                    { x: 'Advisory', y: 'Global', value: 1.0 },
                    { x: 'Training', y: 'UAE', value: 0.0 },
                    { x: 'Training', y: 'GCC', value: 0.2 },
                    { x: 'Training', y: 'MENA', value: 0.5 },
                    { x: 'Training', y: 'Global', value: 0.8 }
                  ]}
                />
              </div>
            </div>
          )}
        </main>
      )}

      {topLevelTab === 'market' && (
        <main className="pb-12 px-8 pt-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-center min-h-[60vh]">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                  <Icon name="TrendingUp" size={32} className="text-gray-400" />
                </div>
                <h2 className="text-2xl font-light text-foreground mb-4">Market Dashboard</h2>
                <p className="text-muted-foreground mb-6">This dashboard is currently under construction.</p>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 max-w-md mx-auto">
                  <p className="text-sm text-yellow-800">
                    Market analytics and insights will be available here soon.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </main>
      )}

      {topLevelTab === 'strategic' && (
        <main className="pb-12 px-8 pt-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-center min-h-[60vh]">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                  <Icon name="Target" size={32} className="text-gray-400" />
                </div>
                <h2 className="text-2xl font-light text-foreground mb-4">Strategic Dashboard</h2>
                <p className="text-muted-foreground mb-6">This dashboard is currently under construction.</p>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md mx-auto">
                  <p className="text-sm text-blue-800">
                    Strategic planning and executive insights will be available here soon.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </main>
      )}
    </div>
  );
};

export default EJPTransactionDashboard;




