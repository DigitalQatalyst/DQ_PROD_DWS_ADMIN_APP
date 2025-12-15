import { useParams } from 'react-router-dom'
import { AppLayout } from '../components/AppLayout'
import { FacetForm } from '../components/TaxonomyForms/FacetForm'

export default function TaxonomyFacetFormRoute() {
  const { facetId } = useParams<{ facetId?: string }>()

  return (
    <AppLayout>
      <FacetForm facetId={facetId} />
    </AppLayout>
  )
}
