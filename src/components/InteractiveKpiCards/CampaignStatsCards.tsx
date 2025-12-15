import React, { Component } from 'react';
import { Mail, MousePointer, Users, UserCheck, Bell, AlertCircle } from 'lucide-react';
export interface CampaignMetric {
  id: string;
  label: string;
  value: string;
  change: string;
  trend: 'up' | 'down' | 'neutral';
  icon: ComponentType<any>;
  color: string;
}
export interface CampaignStatsCardData {
  id: string;
  title: string;
  subtitle?: string;
  metrics: CampaignMetric[];
}
export interface CampaignStatsCardsProps {
  cards: CampaignStatsCardData[];
  className?: string;
  'data-id'?: string;
}
export function CampaignStatsCards({
  cards,
  className = '',
  'data-id': dataId
}: CampaignStatsCardsProps) {
  return <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ${className}`} data-id={dataId}>
      {cards.map(card => <CampaignStatsCard key={card.id} card={card} />)}
    </div>;
}
function CampaignStatsCard({
  card
}: {
  card: CampaignStatsCardData;
}) {
  return <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900">{card.title}</h3>
        {card.subtitle && <p className="text-sm text-gray-500 mt-1">{card.subtitle}</p>}
      </div>
      <div className="space-y-4">
        {card.metrics.map(metric => <div key={metric.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${metric.color}`}>
                <metric.icon size={16} className="text-white" />
              </div>
              <div>
                <div className="font-medium text-gray-900">{metric.label}</div>
                <div className="text-lg font-semibold text-gray-900">
                  {metric.value}
                </div>
              </div>
            </div>
            <div className={`text-sm font-medium ${metric.trend === 'up' ? 'text-green-500' : metric.trend === 'down' ? 'text-red-500' : 'text-gray-500'}`}>
              {metric.change}
            </div>
          </div>)}
      </div>
    </div>;
}