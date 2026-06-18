import { AppLayout } from '@/core/components/AppLayout';
import { authOptions } from '@/core/config/auth';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect('/login');
  }

  const accessToken = session.user?.accessToken;
  if (!accessToken) {
    redirect('/login');
  }

  return <AppLayout>{children}</AppLayout>;
}
