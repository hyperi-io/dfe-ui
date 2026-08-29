import { ComponentsToolbar } from '@/Apps/components/ComponentsToolbar';

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <ComponentsToolbar />
      {children}
    </>
  );
}
