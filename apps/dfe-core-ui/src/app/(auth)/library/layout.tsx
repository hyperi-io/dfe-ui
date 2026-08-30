import { LibraryToolbar } from '@/Library/components/LibraryToolbar';

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <LibraryToolbar />
      {children}
    </>
  );
}
