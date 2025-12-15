import React from 'react';
import { AppLayout } from '../components/AppLayout';
import { ModuleForm } from '../components/course-management/ModuleForm';

export default function ModuleFormRoute() {
  return (
    <AppLayout activeSection="course-management">
      <ModuleForm />
    </AppLayout>
  );
}


