import { FieldMapsToolbar } from '@/FieldMaps/components/FieldMapsToolbar';

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <FieldMapsToolbar />
      {children}
    </>
  );
}
