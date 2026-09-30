import { OIDC_LOGIN_NONCE_PARAM } from '@/core/config/oidcToken.constants';
import { OidcCallbackGate } from '@/core/scenes/LoginScene/OidcCallbackGate';

const first = (value: string | string[] | undefined): string | undefined =>
  typeof value === 'string' ? value : value?.[0];

// The engine's OIDC callback returns the browser here with the token in the
// URL fragment, which only the client can read.
export default async function OidcLoginCallback({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;

  return (
    <OidcCallbackGate
      callbackUrl={first(params?.callbackUrl) ?? '/'}
      loginNonce={first(params?.[OIDC_LOGIN_NONCE_PARAM])}
    />
  );
}
