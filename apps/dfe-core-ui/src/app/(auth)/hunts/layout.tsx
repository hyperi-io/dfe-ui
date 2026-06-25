import { HuntsToolbar } from '@/Hunts/components/HuntsToolbar';

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <HuntsToolbar />
      {children}
    </>
  );
}
