import { useParams } from 'react-router-dom';
import { GrowthAreaForm } from '../components/GrowthAreaForm';
import { Layout } from '../components/Layout';

export default function GrowthAreaFormRoute() {
  const { areaId } = useParams<{ areaId: string }>();
  
  return <Layout>
      <GrowthAreaForm areaId={areaId} />
    </Layout>;
}