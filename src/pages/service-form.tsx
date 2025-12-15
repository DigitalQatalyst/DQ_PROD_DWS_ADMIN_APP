import React from 'react';
import { useParams } from 'react-router-dom';
import { AppLayout } from '../components/AppLayout';
import { ServiceForm } from '../components/ServiceForm';
export default function ServiceFormRoute() {
  const {
    id
  } = useParams<{
    id?: string;
  }>();
  return <AppLayout activeSection="service-management">
      <ServiceForm serviceId={id} />
    </AppLayout>;
}