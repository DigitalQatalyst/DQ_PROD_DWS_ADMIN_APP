import React from 'react';
import { AppLayout } from '../components/AppLayout';
import { GrowthAreasPage } from '../components/GrowthAreasPage';
export default function GrowthAreasRoute() {
  return <AppLayout activeSection="growth-areas">
      <GrowthAreasPage />
    </AppLayout>;
}