import React from 'react';
export interface KpiCardDataNoIcon {
  id: string;
  label: string;
  value: number | string;
  subtitle?: string;
  valueColor?: string;
}
export interface InteractiveKpiCardsNoIconProps {
  cards: KpiCardDataNoIcon[];
  activeFilter?: string | null;
  onFilterByStatus?: (filterId: string | null) => void;
  className?: string;
  'data-id'?: string;
}
export function InteractiveKpiCardsNoIcon({
  cards,
  activeFilter = null,
  onFilterByStatus,
  className = '',
  'data-id': dataId
}: InteractiveKpiCardsNoIconProps) {
  return <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 ${className}`} data-id={dataId}>
      {cards.map(card => <KpiCardNoIcon key={card.id} card={card} isActive={activeFilter === card.id || activeFilter === null && card.id === 'total'} onClick={() => onFilterByStatus?.(card.id === 'total' ? null : card.id)} />)}
    </div>;
}
interface KpiCardNoIconProps {
  card: KpiCardDataNoIcon;
  isActive: boolean;
  onClick: () => void;
}
function KpiCardNoIcon({
  card,
  isActive,
  onClick
}: KpiCardNoIconProps) {
  const valueColor = card.valueColor || 'text-gray-900';
  return <div className={`bg-white rounded-lg border ${isActive ? 'border-blue-300 shadow-sm' : 'border-gray-200'} p-6 cursor-pointer transition-all hover:border-blue-300 hover:shadow-sm`} onClick={onClick} role="button" tabIndex={0} onKeyDown={e => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick();
    }
  }} aria-pressed={isActive}>
      <div className="text-center">
        <p className="text-sm text-gray-500 font-medium mb-2">{card.label}</p>
        <p className={`text-3xl font-bold ${valueColor} mb-1`}>{card.value}</p>
        {card.subtitle && <p className="text-xs text-gray-400">{card.subtitle}</p>}
      </div>
    </div>;
}