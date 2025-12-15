import React from 'react';
import { AppLayout } from '../components/AppLayout';
import { ServiceManagementPage } from '../components/ServiceManagementPage';
export default function ServiceManagementRoute() {
  return <AppLayout activeSection="service-management">
      <ServiceManagementPage />
    </AppLayout>;
}