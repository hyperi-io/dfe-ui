import { ADMIN_MOCKED_RESPONSE } from '@/core/components/RbacProtected/hooks/hooks.mocks';
import { API_CONFIG_MOCKS } from '@/core/config/api/endpoints/generator';
import { REAUTH_MESSAGE } from '@/core/hooks/useReauth';
import { useAuthStore } from '@/core/stores/authStore';
import { buildTestWrapper } from '@/core/utils/test-utils/buildTestWrapper';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import {
  afterAll,
  afterEach,
  beforeAll,
  describe,
  expect,
  it,
  vi,
} from 'vitest';
import { ReauthModal } from '.';

const IDP_URL = 'https://idp.example/authorize?state=test';

const server = setupServer();

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => {
  server.resetHandlers();
  useAuthStore.getState().reset();
  vi.restoreAllMocks();
});
afterAll(() => server.close());

const { wrapper } = buildTestWrapper().withTheme().withReactQuery();

/** Sign in as an account that does or does not sign in through an identity provider, and serve the engine's re-auth routes. */
const signedIn = (external: boolean) => {
  const started: unknown[] = [];
  server.use(
    API_CONFIG_MOCKS.auth.me.get.success({
      mockedResponse: { ...ADMIN_MOCKED_RESPONSE, external },
    }),
    API_CONFIG_MOCKS.auth.reauth.post.success(),
    http.post('/api/v1/auth/oidc/reauth', async ({ request }) => {
      started.push(await request.json());
      return HttpResponse.json({ authorization_url: IDP_URL });
    }),
  );
  return started;
};

let opened: unknown = null;

/** A stand-in for the sign-in window the browser opens. */
const openedWindow = () => {
  const popup = { close: vi.fn(), closed: false, location: { href: '' } };
  vi.spyOn(window, 'open').mockReturnValue(popup as unknown as Window);
  opened = popup;
  return popup;
};

/** Post *data* to the console window as the sign-in window would, or as *source* on *origin*. */
const answer = (
  data: Record<string, string>,
  {
    origin = window.location.origin,
    source = opened,
  }: { origin?: string; source?: unknown } = {},
) =>
  act(() => {
    const event = new MessageEvent('message', {
      data: { type: REAUTH_MESSAGE, ...data },
      origin,
    });
    Object.defineProperty(event, 'source', { value: source });
    window.dispatchEvent(event);
  });

const renderModal = () => {
  const onGranted = vi.fn();
  render(
    <ReauthModal open target="bob" onCancel={vi.fn()} onGranted={onGranted} />,
    { wrapper },
  );
  return onGranted;
};

const signInAgain = async (popup: { location: { href: string } }) => {
  await userEvent.click(
    await screen.findByRole('button', { name: 'Sign in again' }),
  );
  await vi.waitFor(() => expect(popup.location.href).toBe(IDP_URL));
};

describe('ReauthModal', () => {
  it('asks a password account for its password', async () => {
    signedIn(false);
    const onGranted = renderModal();

    await userEvent.type(await screen.findByLabelText('Your password'), 'pw');
    await userEvent.click(screen.getByRole('button', { name: 'Confirm' }));

    await vi.waitFor(() =>
      expect(onGranted).toHaveBeenCalledWith('reauth-grant'),
    );
  });

  it.each([
    {
      verb: undefined,
      kind: undefined,
      text: 'You are about to change account',
    },
    {
      verb: 'create',
      kind: 'group' as const,
      text: 'You are about to create group',
    },
  ])('says "$text"', async ({ verb, kind, text }) => {
    signedIn(false);
    render(
      <ReauthModal
        kind={kind}
        open
        target="bob"
        verb={verb}
        onCancel={vi.fn()}
        onGranted={vi.fn()}
      />,
      { wrapper },
    );

    const line = await screen.findByText(
      (_, element) =>
        element?.tagName === 'P' && element.textContent === `${text} bob.`,
    );
    expect(line).toBeInTheDocument();
  });

  it('sends an identity-provider account to sign in again and takes the grant its window posts back', async () => {
    const started = signedIn(true);
    const popup = openedWindow();
    const onGranted = renderModal();

    await signInAgain(popup);
    expect(started).toEqual([
      {
        kind: 'account',
        return_to: `${window.location.origin}/login/reauth`,
        target: 'bob',
      },
    ]);
    expect(screen.queryByLabelText('Your password')).not.toBeInTheDocument();

    answer({ grant: 'idp-grant' });

    expect(onGranted).toHaveBeenCalledWith('idp-grant');
  });

  it.each([
    ['reauth_other_person', 'That sign-in was a different account.'],
    ['reauth_not_fresh', /didn't ask for your credentials again/],
    ['unrecognised', "The sign-in didn't complete. Try again."],
  ])('says why a refused sign-in (%s) earned nothing', async (code, text) => {
    signedIn(true);
    const popup = openedWindow();
    const onGranted = renderModal();

    await signInAgain(popup);
    answer({ error: code });

    expect(await screen.findByText(text)).toBeInTheDocument();
    expect(onGranted).not.toHaveBeenCalled();
  });

  it('ignores a grant posted from another origin', async () => {
    signedIn(true);
    const popup = openedWindow();
    const onGranted = renderModal();

    await signInAgain(popup);
    answer({ grant: 'forged' }, { origin: 'https://evil.example' });

    expect(onGranted).not.toHaveBeenCalled();
  });

  it('ignores a grant posted by another window on this origin', async () => {
    signedIn(true);
    const popup = openedWindow();
    const onGranted = renderModal();

    await signInAgain(popup);
    answer({ grant: 'forged' }, { source: {} });

    expect(onGranted).not.toHaveBeenCalled();
  });

  it('asks for pop-ups when the browser blocks the sign-in window', async () => {
    signedIn(true);
    vi.spyOn(window, 'open').mockReturnValue(null);
    renderModal();

    await userEvent.click(
      await screen.findByRole('button', { name: 'Sign in again' }),
    );

    expect(
      await screen.findByText('Allow pop-ups for this site, then try again.'),
    ).toBeInTheDocument();
  });
});
