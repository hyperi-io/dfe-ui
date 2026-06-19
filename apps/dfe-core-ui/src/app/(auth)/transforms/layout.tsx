import { TransformsToolbar } from '@/_Transforms/components/TransformsToolbar';

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <TransformsToolbar />
      {children}
    </>
  );
}
