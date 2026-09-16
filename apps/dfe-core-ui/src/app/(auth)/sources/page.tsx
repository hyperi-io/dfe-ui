import { SourcesListScene } from '@/Sources/scenes/SourcesList';
import { redirect } from 'next/navigation';

type SearchParams = Promise<{
  [key: string]: string | string[] | undefined;
}>;
export default async function SourcesPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { source_name, source_version } = await searchParams;

  if (!(source_name && source_version)) {
    return redirect('/sources?source_name=main&source_version=1.0.0');
  }

  return <SourcesListScene />;
}
