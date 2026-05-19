import { SchemasToolbar } from '@/Schemas/components/SchemasToolbar';

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <SchemasToolbar />
      {children}
    </>
  );
}
