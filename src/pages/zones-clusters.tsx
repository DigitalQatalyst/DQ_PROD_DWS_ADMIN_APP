import React from 'react';
import { AppLayout } from '../components/AppLayout';
import { ZonesClustersPage } from '../components/ZonesClustersPage';
export default function ZonesClustersRoute() {
  return <AppLayout activeSection="zones-clusters">
      <ZonesClustersPage />
    </AppLayout>;
}