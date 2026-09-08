import { OidcCallbackGate } from '@/core/scenes/LoginScene/OidcCallbackGate';

// The engine's OIDC callback returns the browser here with the token in the
// URL fragment, which only the client can read.
export default async function OidcLoginCallback({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string | string[] }>;
}) {
  const params = await searchParams;
  const callbackUrl =
    (typeof params?.callbackUrl === 'string'
      ? params.callbackUrl
      : params?.callbackUrl?.[0]) ?? '/';

  return <OidcCallbackGate callbackUrl={callbackUrl} />;
}
