import { rememberOidcLoginNonce } from '@/core/auth/oidcLoginNonce';
import { render, screen, waitFor } from '@testing-library/react';
import { signIn } from 'next-auth/react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { OidcCallbackGate } from './OidcCallbackGate';

const { replace, refresh } = vi.hoisted(() => ({
  replace: vi.fn(),
  refresh: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace, refresh }),
}));

// The form fetches setup status; the gate's decision and what the page says are under test.
vi.mock('@/core/components/LoginLocalOidcSwitch', () => ({
  LoginLocalOidcSwitch: () => <div>login form</div>,
}));

const mockedSignIn = vi.mocked(signIn);

const landOn = (search: string, fragment: string) => {
  window.history.replaceState(null, '', `/login/oidc${search}#${fragment}`);
};

describe('OidcCallbackGate', () => {
  beforeEach(() => {
    window.sessionStorage.clear();
    mockedSignIn.mockResolvedValue({
      error: null,
      ok: true,
      status: 200,
      url: null,
    });
  });
  afterEach(() => {
    vi.clearAllMocks();
  });

  test('signs in with the handed-back token when this tab started the login', async () => {
    rememberOidcLoginNonce('n1');
    landOn('?callbackUrl=%2Frules&login_nonce=n1', 'access_token=engine-jwt');

    render(<OidcCallbackGate callbackUrl="/rules" loginNonce="n1" />);

    await waitFor(() => expect(replace).toHaveBeenCalledWith('/rules'));
    expect(mockedSignIn).toHaveBeenCalledWith('oidc-token', {
      redirect: false,
      token: 'engine-jwt',
    });
    // The token never stays in the address bar.
    expect(window.location.hash).toBe('');
  });

  test('a link this tab did not start signs nobody in, whatever token it carries', async () => {
    landOn('?login_nonce=attacker-chosen', 'access_token=attacker-jwt');

    render(<OidcCallbackGate loginNonce="attacker-chosen" />);

    expect(
      await screen.findByText(/not started from this browser tab/),
    ).toBeInTheDocument();
    expect(mockedSignIn).not.toHaveBeenCalled();
    expect(replace).not.toHaveBeenCalled();
    expect(window.location.hash).toBe('');
  });

  test('a nonce other than the one this tab stored signs nobody in', async () => {
    rememberOidcLoginNonce('n1');
    landOn('?login_nonce=n2', 'access_token=attacker-jwt');

    render(<OidcCallbackGate loginNonce="n2" />);

    expect(
      await screen.findByText(/not started from this browser tab/),
    ).toBeInTheDocument();
    expect(mockedSignIn).not.toHaveBeenCalled();
  });

  test('a callbackUrl that leaves the console lands on its home instead', async () => {
    rememberOidcLoginNonce('n1');
    landOn('?login_nonce=n1', 'access_token=engine-jwt');

    render(<OidcCallbackGate callbackUrl="/\evil.example" loginNonce="n1" />);

    await waitFor(() => expect(replace).toHaveBeenCalledWith('/'));
  });

  test('an engine that refuses the token shows the failure', async () => {
    rememberOidcLoginNonce('n1');
    landOn('?login_nonce=n1', 'access_token=expired-jwt');
    mockedSignIn.mockResolvedValue({
      error: 'CredentialsSignin',
      ok: false,
      status: 401,
      url: null,
    });

    render(<OidcCallbackGate loginNonce="n1" />);

    expect(
      await screen.findByText('The engine did not accept the login token.'),
    ).toBeInTheDocument();
    expect(replace).not.toHaveBeenCalled();
  });

  test('a user with no DFE role is told why, on the sign-in form, and signed in nowhere', async () => {
    rememberOidcLoginNonce('n1');
    landOn('?login_nonce=n1', 'error=no_role_granted&provider=dex');

    render(<OidcCallbackGate loginNonce="n1" />);

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent('No access to DFE yet');
    expect(alert).toHaveTextContent(/Ask a DFE administrator to link one/);
    expect(alert).toHaveTextContent(/sign out of your identity provider/);
    expect(screen.getByText('login form')).toBeInTheDocument();
    expect(mockedSignIn).not.toHaveBeenCalled();
    expect(replace).not.toHaveBeenCalled();
    expect(window.location.hash).toBe('');
    // The nonce is spent, so the same hand-back cannot be replayed into a sign-in.
    expect(window.sessionStorage.length).toBe(0);
  });

  test('a refusal carrying a token as well signs nobody in', async () => {
    rememberOidcLoginNonce('n1');
    landOn('?login_nonce=n1', 'access_token=engine-jwt&error=account_blocked');

    render(<OidcCallbackGate loginNonce="n1" />);

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Account blocked',
    );
    expect(mockedSignIn).not.toHaveBeenCalled();
  });

  test.each(['made_up_code', 'constructor', '__proto__'])(
    'a refusal code of %j gets the general failure words, never its own',
    async (code) => {
      landOn('', `error=${code}`);

      render(<OidcCallbackGate />);

      const alert = await screen.findByRole('alert');
      expect(alert).toHaveTextContent('Sign-in failed');
      expect(alert).not.toHaveTextContent(code);
      expect(mockedSignIn).not.toHaveBeenCalled();
    },
  );
});
