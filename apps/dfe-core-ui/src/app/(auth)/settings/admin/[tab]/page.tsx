import { AdminControlsScene } from '@/Settings/scenes/AdminControls';
import { isAdminTabKey } from '@/Settings/scenes/AdminControls/adminTabs';
import { notFound } from 'next/navigation';

export default async function AdminTabPage({
  params,
}: {
  params: Promise<{ tab: string }>;
}) {
  const { tab } = await params;
  if (!isAdminTabKey(tab)) {
    notFound();
  }

  return <AdminControlsScene />;
}
