import BookFlow from './BookFlow';

export default async function BookPage({ params }: { params: Promise<{ serviceId: string }> }) {
  const { serviceId } = await params;
  return <BookFlow slug={serviceId} />;
}
