import { useParams } from 'react-router-dom'
import { AppLayout } from '../components/AppLayout'
import { CollectionForm } from '../components/TaxonomyForms/CollectionForm'

export default function TaxonomyCollectionFormRoute() {
  const { collectionId } = useParams<{ collectionId?: string }>()

  return (
    <AppLayout>
      <CollectionForm collectionId={collectionId} />
    </AppLayout>
  )
}
