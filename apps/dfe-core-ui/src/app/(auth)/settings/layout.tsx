import { SettingsToolbar } from '@/Settings/components/SettingsToolbar';

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <SettingsToolbar />
      {children}
    </>
  );
}
