import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
export interface CountryStatData {
  id: string;
  country: string;
  flag: string;
  value: string;
  change: number;
  trend: 'up' | 'down';
}
export interface CountryStatsCardData {
  id: string;
  title: string;
  subtitle?: string;
  countries: CountryStatData[];
}
export interface CountryStatsCardsProps {
  cards: CountryStatsCardData[];
  className?: string;
  'data-id'?: string;
}
export function CountryStatsCards({
  cards,
  className = '',
  'data-id': dataId
}: CountryStatsCardsProps) {
  return <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ${className}`} data-id={dataId}>
      {cards.map(card => <CountryStatsCard key={card.id} card={card} />)}
    </div>;
}
function CountryStatsCard({
  card
}: {
  card: CountryStatsCardData;
}) {
  return <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900">{card.title}</h3>
        {card.subtitle && <p className="text-sm text-gray-500 mt-1">{card.subtitle}</p>}
      </div>
      <div className="space-y-4">
        {card.countries.map(country => <div key={country.id} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="text-2xl">{country.flag}</div>
              <div>
                <div className="font-medium text-gray-900">
                  {country.country}
                </div>
                <div className="text-sm text-gray-500">{country.value}</div>
              </div>
            </div>
            <div className={`flex items-center gap-1 text-sm font-medium ${country.trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
              {country.trend === 'up' ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
              <span>{Math.abs(country.change)}%</span>
            </div>
          </div>)}
      </div>
    </div>;
}