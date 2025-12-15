import { useParams } from 'react-router-dom'
import { AppLayout } from '../components/AppLayout'
import { TagForm } from '../components/TaxonomyForms/TagForm'

export default function TaxonomyTagFormRoute() {
  const { tagId } = useParams<{ tagId?: string }>()

  return (
    <AppLayout>
      <TagForm tagId={tagId} />
    </AppLayout>
  )
}
