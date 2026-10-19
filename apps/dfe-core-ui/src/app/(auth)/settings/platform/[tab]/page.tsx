import { PlatformScene } from '@/Platform/scenes/PlatformScene';
import { isPlatformTabKey } from '@/Platform/scenes/PlatformScene/platformTabs';
import { notFound } from 'next/navigation';

export default async function PlatformTabPage({
  params,
}: {
  params: Promise<{ tab: string }>;
}) {
  const { tab } = await params;
  if (!isPlatformTabKey(tab)) {
    notFound();
  }

  return <PlatformScene />;
}
