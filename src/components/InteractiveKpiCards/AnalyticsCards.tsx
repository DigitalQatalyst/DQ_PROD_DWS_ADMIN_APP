import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, BarChart, Bar, XAxis, YAxis, Area, AreaChart } from 'recharts';
import { TrendingUp, TrendingDown } from 'lucide-react';
// GraphQL-compatible interfaces
export interface ChartDataPoint {
  name: string;
  value: number;
  color?: string;
}
export interface MetricData {
  label: string;
  value: string;
  color?: string;
}
export interface AnalyticsCardData {
  id: string;
  title: string;
  subtitle?: string;
  type: 'donut' | 'line' | 'bar' | 'area' | 'metric';
  value: string | number;
  percentage?: number;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  chartData?: ChartDataPoint[];
  metrics?: MetricData[];
  color?: string;
  gradientColors?: [string, string];
}
export interface AnalyticsCardsProps {
  cards: AnalyticsCardData[];
  loading?: boolean;
  error?: string;
  className?: string;
  'data-id'?: string;
}
export function AnalyticsCards({
  cards,
  loading = false,
  error,
  className = '',
  'data-id': dataId
}: AnalyticsCardsProps) {
  if (loading) {
    return <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 ${className}`} data-id={dataId}>
        {Array.from({
        length: 4
      }).map((_, index) => <SkeletonCard key={index} />)}
      </div>;
  }
  if (error) {
    return <div className="text-center p-8">
        <p className="text-red-500">Error loading analytics: {error}</p>
      </div>;
  }
  return <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 ${className}`} data-id={dataId}>
      {cards.map(card => <AnalyticsCard key={card.id} card={card} />)}
    </div>;
}
function SkeletonCard() {
  return <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
      <div className="h-3 bg-gray-200 rounded w-1/2 mb-6"></div>
      <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
      <div className="h-24 bg-gray-200 rounded mb-4"></div>
    </div>;
}
function AnalyticsCard({
  card
}: {
  card: AnalyticsCardData;
}) {
  const getTrendIcon = () => {
    if (card.trend === 'up') return <TrendingUp size={14} className="text-green-500" />;
    if (card.trend === 'down') return <TrendingDown size={14} className="text-red-500" />;
    return null;
  };
  const getTrendColor = () => {
    if (card.trend === 'up') return 'text-green-500';
    if (card.trend === 'down') return 'text-red-500';
    return 'text-gray-500';
  };
  const renderChart = () => {
    if (!card.chartData || card.chartData.length === 0) {
      return <div className="h-24 w-full mb-6 bg-gray-50 rounded-lg flex items-center justify-center">
          <p className="text-gray-400 text-sm">No data available</p>
        </div>;
    }
    const chartColor = card.color || '#10B981';
    const gradientId = `gradient-${card.id}`;
    switch (card.type) {
      case 'area':
        return <div className="h-24 w-full mb-6">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={card.chartData}>
                <defs>
                  <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={chartColor} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={chartColor} stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" hide />
                <YAxis hide />
                <Area type="monotone" dataKey="value" stroke={chartColor} strokeWidth={2} fill={`url(#${gradientId})`} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>;
      case 'line':
        return <div className="h-24 w-full mb-6">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={card.chartData}>
                <XAxis dataKey="name" hide />
                <YAxis hide />
                <Line type="monotone" dataKey="value" stroke={chartColor} strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>;
      case 'bar':
        return <div className="h-24 w-full mb-6">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={card.chartData}>
                <XAxis dataKey="name" hide />
                <YAxis hide />
                <Bar dataKey="value" fill={chartColor} radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>;
      case 'donut':
        return <div className="h-32 w-32 mx-auto mb-6">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={card.chartData} cx="50%" cy="50%" innerRadius={35} outerRadius={55} dataKey="value">
                  {card.chartData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color || chartColor} />)}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>;
      default:
        return null;
    }
  };
  return <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      {/* Header - Clean and minimal */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-1">
          {card.title}
        </h3>
        {card.subtitle && <p className="text-sm text-gray-500">{card.subtitle}</p>}
      </div>
      {/* Main Value */}
      <div className="mb-6">
        <div className="text-3xl font-bold text-gray-900 mb-2">
          {card.value}
        </div>
        {card.trendValue && <div className={`flex items-center gap-1 text-sm ${getTrendColor()}`}>
            {getTrendIcon()}
            <span>{card.trendValue}</span>
          </div>}
      </div>
      {/* Chart */}
      {renderChart()}
      {/* Bottom Metrics */}
      {card.metrics && card.metrics.length > 0 && <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-100">
          {card.metrics.map((metric, index) => <div key={index} className="text-center">
              <div className={`text-sm font-semibold ${metric.color || 'text-gray-900'}`}>
                {metric.value}
              </div>
              <div className="text-xs text-gray-500">{metric.label}</div>
            </div>)}
        </div>}
    </div>;
}