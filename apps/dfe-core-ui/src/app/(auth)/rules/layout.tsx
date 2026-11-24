import { RulesToolbar } from '@/RulesV2/components/RulesToolbar';

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
