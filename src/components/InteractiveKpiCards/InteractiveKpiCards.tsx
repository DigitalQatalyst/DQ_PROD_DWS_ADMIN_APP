import React, { Component } from 'react';
import { BoxIcon } from 'lucide-react';
export interface KpiCardData {
  id: string;
  label: string;
  value: number | string;
  icon: BoxIcon;
  iconColor?: string;
  iconBgColor?: string;
}
export interface InteractiveKpiCardsProps {
  cards: KpiCardData[];
  activeFilter?: string | null;
  onFilterByStatus?: (filterId: string | null) => void;
  className?: string;
  'data-id'?: string;
}
export function InteractiveKpiCards({
  cards,
  activeFilter = null,
  onFilterByStatus,
  className = '',
  'data-id': dataId
}: InteractiveKpiCardsProps) {
  return <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 ${className}`} data-id={dataId}>
      {cards.map(card => <KpiCard key={card.id} card={card} isActive={activeFilter === card.id || activeFilter === null && card.id === 'total'} onClick={() => onFilterByStatus?.(card.id === 'total' ? null : card.id)} />)}
    </div>;
}
interface KpiCardProps {
  card: KpiCardData;
  isActive: boolean;
  onClick: () => void;
}
function KpiCard({
  card,
  isActive,
  onClick
}: KpiCardProps) {
  const IconComponent = card.icon;
  const iconColor = card.iconColor || 'text-blue-600';
  const iconBgColor = card.iconBgColor || 'bg-blue-100';
  return <div className={`bg-white rounded-lg border ${isActive ? 'border-blue-300 shadow-sm' : 'border-gray-200'} p-4 flex items-center cursor-pointer transition-all hover:border-blue-300 hover:shadow-sm`} onClick={onClick} role="button" tabIndex={0} onKeyDown={e => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick();
    }
  }} aria-pressed={isActive}>
      <div className={`rounded-full ${iconBgColor} p-3 mr-3 flex-shrink-0`}>
        <IconComponent size={20} className={iconColor} />
      </div>
      <div>
        <p className="text-sm text-gray-500 font-medium">{card.label}</p>
        <p className="text-xl font-semibold">{card.value}</p>
      </div>
    </div>;
}