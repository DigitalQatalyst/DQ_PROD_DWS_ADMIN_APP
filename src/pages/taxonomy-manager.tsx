import React from 'react'
import { useSearchParams } from 'react-router-dom'
import { AppLayout } from '../components/AppLayout'
import { TaxonomyManagerPage } from '../components/TaxonomyManagerPage'
export default function TaxonomyManagerRoute() {
  const [searchParams] = useSearchParams()
  const scope = searchParams.get('scope')

  // Determine active section based on scope parameter
  const activeSection = scope === 'Content'
    ? 'content-taxonomy'
    : scope === 'Marketplace'
    ? 'marketplace-taxonomy'
    : 'content-taxonomy' // default to content taxonomy

  return (
    <AppLayout activeSection={activeSection}>
      <TaxonomyManagerPage />
    </AppLayout>
  )
}
