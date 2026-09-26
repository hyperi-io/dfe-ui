import { authOptions } from '@/core/config/auth';
import {
  CHANGE_PASSWORD_PATH,
  isAppShellSession,
  isPasswordChangeRequired,
} from '@/core/config/authSession';
import { loginRedirectPath } from '@/core/config/loginCallback';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';

// Consults the session: never static, or the build-time prerender caches an
// anonymous render of a page that must never be anonymous.
export const dynamic = 'force-dynamic';

// The wizard sits in (no-auth) so it keeps its own full-screen scene rather than
// inheriting the app chrome, and /setup is excluded from the proxy matcher so
// the login bounce cannot loop through it. That leaves this layout as the only
// guard on the route: every step the wizard renders posts to the engine as the
// signed-in operator, so no session means no wizard.
export default async function SetupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // The same predicate the login page redirects INTO the wizard on. Anything
  // weaker on one side and the two guards disagree about a half-dead session --
  // one sends it to the login, the other sends it straight back.
  const session = await getServerSession(authOptions);
  if (!isAppShellSession(session)) {
    redirect(loginRedirectPath('/setup'));
  }
  // The change comes before the wizard: every step posts as this account, and
  // the engine refuses an issued password everything but the change.
  if (isPasswordChangeRequired(session)) {
    redirect(CHANGE_PASSWORD_PATH);
  }

  return children;
}
