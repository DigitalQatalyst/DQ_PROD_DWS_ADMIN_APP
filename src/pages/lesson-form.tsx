import React from 'react';
import { AppLayout } from '../components/AppLayout';
import { LessonForm } from '../components/course-management/LessonForm';

export default function LessonFormRoute() {
  return (
    <AppLayout activeSection="course-management">
      <LessonForm />
    </AppLayout>
  );
}



