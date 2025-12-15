import React from 'react';
import { AppLayout } from '../components/AppLayout';
import { CourseManagementPage } from '../components/CourseManagementPage';

export default function CourseManagementRoute() {
  return (
    <AppLayout activeSection="course-management">
      <CourseManagementPage />
    </AppLayout>
  );
}

