import { ServicesToolbar } from '@/Services/components/ServicesToolbar';

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <ServicesToolbar />
      {children}
    </>
  );
}
