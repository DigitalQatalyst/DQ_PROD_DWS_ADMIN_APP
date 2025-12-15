import React from 'react';
import { AppLayout } from '../components/AppLayout';
import { LearningPathForm } from '../components/course-management/LearningPathForm';

export default function LearningPathFormRoute() {
  return (
    <AppLayout activeSection="course-management">
      <LearningPathForm />
    </AppLayout>
  );
}

