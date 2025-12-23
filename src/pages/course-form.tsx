import React from 'react';
import { AppLayout } from '../components/AppLayout';
import { CourseForm } from '../components/course-management/CourseForm';

export default function CourseFormRoute() {
  return (
    <AppLayout activeSection="course-management">
      <CourseForm />
    </AppLayout>
  );
}



