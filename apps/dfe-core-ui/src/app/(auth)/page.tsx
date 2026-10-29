import { authOptions } from '@/core/config/auth';
import { landingPath } from '@/core/config/landingPath';
import { getAuthPermissions } from '@/core/server/actions/getAuthPermissions';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';

export default async function HomePage() {
  const session = await getServerSession(authOptions);
  const permissions = await getAuthPermissions(session?.user?.accessToken);
  return redirect(
    landingPath(
      new Set(permissions),
      process.env.HYPERDX_URL || process.env.HYPERDX_PORT || undefined,
    ),
  );
}
