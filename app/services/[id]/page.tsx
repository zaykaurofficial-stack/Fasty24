import ServiceDetail from './ServiceDetail';

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ServiceDetail slug={id} />;
}
