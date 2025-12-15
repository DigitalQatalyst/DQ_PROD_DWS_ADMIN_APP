import React from 'react';
import { AppLayout } from '../components/AppLayout';
import { BusinessDirectoryPage } from '../components/BusinessDirectoryPage';
export default function BusinessDirectoryRoute() {
  return <AppLayout activeSection="business-directory">
      <BusinessDirectoryPage />
    </AppLayout>;
}