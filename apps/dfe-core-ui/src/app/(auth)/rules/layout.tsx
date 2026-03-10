import { RulesToolbar } from '@/Rules/components/RulesToolbar';

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <RulesToolbar />
      {children}
    </>
  );
}
