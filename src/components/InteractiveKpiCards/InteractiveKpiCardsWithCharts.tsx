import React from 'react';
import { LineChart, Line, BarChart, Bar, ResponsiveContainer, XAxis, YAxis } from 'recharts';
export type ChartType = 'line' | 'bar';
export interface ChartData {
  name: string;
  value: number;
}
export interface KpiCardDataWithChart {
  id: string;
  label: string;
  value: number | string;
  chartData: ChartData[];
  chartType: ChartType;
  chartColor?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
}
export interface InteractiveKpiCardsWithChartsProps {
  cards: KpiCardDataWithChart[];
  activeFilter?: string | null;
  onFilterByStatus?: (filterId: string | null) => void;
  className?: string;
  'data-id'?: string;
}
export function InteractiveKpiCardsWithCharts({
  cards,
  activeFilter = null,
  onFilterByStatus,
  className = '',
  'data-id': dataId
}: InteractiveKpiCardsWithChartsProps) {
  return <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 ${className}`} data-id={dataId}>
      {cards.map(card => <KpiCardWithChart key={card.id} card={card} isActive={activeFilter === card.id || activeFilter === null && card.id === 'total'} onClick={() => onFilterByStatus?.(card.id === 'total' ? null : card.id)} />)}
    </div>;
}
interface KpiCardWithChartProps {
  card: KpiCardDataWithChart;
  isActive: boolean;
  onClick: () => void;
}
function KpiCardWithChart({
  card,
  isActive,
  onClick
}: KpiCardWithChartProps) {
  const chartColor = card.chartColor || '#3B82F6';
  const getTrendColor = () => {
    switch (card.trend) {
      case 'up':
        return 'text-green-600';
      case 'down':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };
  const getTrendIcon = () => {
    switch (card.trend) {
      case 'up':
        return '↗';
      case 'down':
        return '↘';
      default:
        return '→';
    }
  };
  return <div className={`bg-white rounded-lg border ${isActive ? 'border-blue-300 shadow-sm' : 'border-gray-200'} p-4 cursor-pointer transition-all hover:border-blue-300 hover:shadow-sm`} onClick={onClick} role="button" tabIndex={0} onKeyDown={e => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick();
    }
  }} aria-pressed={isActive}>
      <div className="flex justify-between items-start mb-3">
        <div>
          <p className="text-sm text-gray-500 font-medium">{card.label}</p>
          <p className="text-2xl font-bold text-gray-900">{card.value}</p>
          {card.trendValue && <p className={`text-sm font-medium ${getTrendColor()}`}>
              {getTrendIcon()} {card.trendValue}
            </p>}
        </div>
      </div>
      <div className="h-16 w-full">
        <ResponsiveContainer width="100%" height="100%">
          {card.chartType === 'line' ? <LineChart data={card.chartData}>
              <XAxis dataKey="name" hide />
              <YAxis hide />
              <Line type="monotone" dataKey="value" stroke={chartColor} strokeWidth={2} dot={false} />
            </LineChart> : <BarChart data={card.chartData}>
              <XAxis dataKey="name" hide />
              <YAxis hide />
              <Bar dataKey="value" fill={chartColor} />
            </BarChart>}
        </ResponsiveContainer>
      </div>
    </div>;
}