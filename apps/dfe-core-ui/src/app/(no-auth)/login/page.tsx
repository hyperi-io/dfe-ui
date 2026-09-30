import { authOptions } from '@/core/config/auth';
import {
  CHANGE_PASSWORD_PATH,
  isAppShellSession,
  isPasswordChangeRequired,
} from '@/core/config/authSession';
import { safeRedirectPath } from '@/core/config/loginCallback';
import { LOGIN_NOTICE_PARAM } from '@/core/config/loginNotice';
import { LoginScene } from '@/core/scenes/LoginScene';
import { getSetupStatus } from '@/core/server/actions/getSetupStatus';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';

// Consults deployment state (getSetupStatus): never static -- build-time
// prerender has no env and fails the build.
export const dynamic = 'force-dynamic';

const first = (value: string | string[] | undefined): string | undefined =>
  typeof value === 'string' ? value : value?.[0];

export default async function Login({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const callbackUrl = safeRedirectPath(first(params?.callbackUrl));

  // The wizard needs an authenticated session, so the form must stay
  // reachable while setup is incomplete -- only signed-in users are
  // herded into the wizard.
  const session = await getServerSession(authOptions);
  const { initial_setup } = await getSetupStatus();

  if (isAppShellSession(session) && isPasswordChangeRequired(session)) {
    redirect(CHANGE_PASSWORD_PATH);
  }
  // isAppShellSession, not a bare truthy check: a session whose engine token is
  // missing or expired cannot run the wizard, so sending it there strands the
  // operator on a form that 401s with no way back to this page.
  if (isAppShellSession(session) && !initial_setup.complete) {
    redirect('/setup');
  }
  if (isAppShellSession(session)) {
    redirect(callbackUrl);
  }

  return (
    <LoginScene
      callbackUrl={callbackUrl}
      notice={first(params?.[LOGIN_NOTICE_PARAM])}
    />
  );
}
