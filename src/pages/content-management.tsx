import React from 'react';
import { AppLayout } from '../components/AppLayout';
import { ContentManagementPage } from '../components/ContentManagementPage';
export default function ContentManagementRoute() {
  return <AppLayout activeSection="media-management">
    <ContentManagementPage />
  </AppLayout>;
}