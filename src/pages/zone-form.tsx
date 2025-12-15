import React from 'react';
import { ZoneForm } from '../components/ZoneForm';
import { Layout } from '../components/Layout';
import { useParams } from 'react-router-dom';
export default function ZoneFormRoute() {
  // Extract zoneId from URL parameters
  const {
    zoneId
  } = useParams();
  return <Layout>
      <ZoneForm zoneId={zoneId} />
    </Layout>;
}