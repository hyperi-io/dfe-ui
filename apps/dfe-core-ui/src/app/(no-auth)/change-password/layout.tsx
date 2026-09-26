import { authOptions } from '@/core/config/auth';
import {
  CHANGE_PASSWORD_PATH,
  isAppShellSession,
} from '@/core/config/authSession';
import { loginRedirectPath } from '@/core/config/loginCallback';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';

// Consults the session: never static, or the build-time prerender caches an
// anonymous render of a page that must never be anonymous.
export const dynamic = 'force-dynamic';

// The route's only guard, since the proxy skips it, and it keeps a session whose flag reads clear because the API client sends a stale one here.
export default async function ChangePasswordLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  if (!isAppShellSession(session)) {
    redirect(loginRedirectPath(CHANGE_PASSWORD_PATH));
  }

  return children;
}
