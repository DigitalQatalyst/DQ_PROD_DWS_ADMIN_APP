import React from 'react';
import { BusinessForm } from '../components/BusinessForm';
import { Layout } from '../components/Layout';
import { useParams } from 'react-router-dom';
export default function BusinessFormRoute() {
  // Extract businessId from URL parameters
  const {
    businessId
  } = useParams();
  return <Layout>
      <BusinessForm businessId={businessId} />
    </Layout>;
}