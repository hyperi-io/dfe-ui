import { PlatformToolbar } from '@/Platform/components/PlatformToolbar';

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <PlatformToolbar />
      {children}
    </>
  );
}
