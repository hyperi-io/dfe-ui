import { authOptions } from '@/core/config/auth';
import { LoginScene } from '@/core/scenes/LoginScene';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';

export default async function Login({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const session = await getServerSession(authOptions);

  if (session) {
    redirect('/');
  }
  const params = await searchParams;
  const callbackUrl =
    (typeof params?.callbackUrl === 'string'
      ? params.callbackUrl
      : params?.callbackUrl?.[0]) ?? '/';
  return <LoginScene callbackUrl={callbackUrl} />;
}
