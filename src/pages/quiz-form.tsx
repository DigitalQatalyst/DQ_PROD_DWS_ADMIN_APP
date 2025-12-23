import React from 'react';
import { AppLayout } from '../components/AppLayout';
import { QuizForm } from '../components/course-management/QuizForm';

export default function QuizFormRoute() {
  return (
    <AppLayout activeSection="course-management">
      <QuizForm />
    </AppLayout>
  );
}



