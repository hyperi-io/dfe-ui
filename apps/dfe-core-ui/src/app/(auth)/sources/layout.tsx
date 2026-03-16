import { SourcesToolbar } from '@/Sources/components/SourcesToolbar';

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <SourcesToolbar />
      {children}
    </>
  );
}
