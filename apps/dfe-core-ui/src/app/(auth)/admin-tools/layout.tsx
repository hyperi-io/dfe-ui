import { AdminToolsToolbar } from '@/AdminTools/components/AdminToolsToolbar';

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <AdminToolsToolbar />
      {children}
    </>
  );
}
