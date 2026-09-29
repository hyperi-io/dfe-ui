import { consumeOidcLoginNonce } from '@/core/auth/oidcLoginNonce';
import { API_CONFIG_MOCKS } from '@/core/config/api/endpoints/generator';
import { buildTestWrapper } from '@/core/utils/test-utils/buildTestWrapper';
import { render, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  test,
  vi,
} from 'vitest';
import { OidcLoginPopup, oidcReturnUrl } from '.';

const { navigateWithReload } = vi.hoisted(() => ({
  navigateWithReload: vi.fn(),
}));

vi.mock('@/core/utils/navigation', () => ({ navigateWithReload }));

const IDP_URL = 'https://idp.example.com/authorize?state=s';
const returnTos: string[] = [];

const server = setupServer(
  http.get(
    API_CONFIG_MOCKS.oidc.login.mockedUrl.replace('{provider}', ':provider'),
    ({ request }) => {
      returnTos.push(new URL(request.url).searchParams.get('return_to') ?? '');
      return HttpResponse.json({ authorization_url: IDP_URL });
    },
  ),
);

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => {
  server.resetHandlers();
  navigateWithReload.mockClear();
});
afterAll(() => server.close());

const { wrapper } = buildTestWrapper().withReactQuery();

describe('oidcReturnUrl', () => {
  test('returns to the callback page with the path and the nonce', () => {
    expect(
      oidcReturnUrl('https://dfe.example.com', '/rules?name=a', 'n1'),
    ).toBe(
      'https://dfe.example.com/login/oidc?callbackUrl=%2Frules%3Fname%3Da&login_nonce=n1',
    );
  });

  test('a callbackUrl that leaves the console becomes its home', () => {
    expect(
      oidcReturnUrl('https://dfe.example.com', '//evil.example', 'n1'),
    ).toBe('https://dfe.example.com/login/oidc?callbackUrl=%2F&login_nonce=n1');
  });
});

describe('OidcLoginPopup', () => {
  beforeEach(() => {
    returnTos.length = 0;
    window.sessionStorage.clear();
  });

  test('stores the nonce it hands the engine before leaving for the IdP', async () => {
    render(
      <OidcLoginPopup
        closePopup={() => undefined}
        oidcProviderName="corp-sso"
        callbackUrl="/sources"
      />,
      { wrapper },
    );

    await waitFor(() =>
      expect(navigateWithReload).toHaveBeenCalledWith(IDP_URL),
    );
    const handedToEngine = new URL(returnTos[0] ?? '').searchParams.get(
      'login_nonce',
    );
    expect(handedToEngine).toMatch(/^[0-9a-f]{32}$/);
    expect(consumeOidcLoginNonce(handedToEngine)).toBe(true);
  });
});
