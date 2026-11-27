import { ADMIN_MOCKED_RESPONSE } from '@/core/components/RbacProtected/hooks/hooks.mocks';
import { API_CONFIG_MOCKS } from '@/core/config/api/endpoints/generator';
import { confirmReauth } from '@/core/utils/test-utils/confirmReauth';
import { buildTestWrapper } from '@/core/utils/test-utils/buildTestWrapper';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import {
  afterAll,
  afterEach,
  beforeAll,
  describe,
  expect,
  test,
  vi,
} from 'vitest';
import { EnableDisableOrganisation } from '.';

vi.mock('@/core/components/RbacProtected/hooks/useRbac', () => ({
  useRbac: () => ({ isAuthorized: true, isLoading: false, isError: false }),
}));

const sent: { body: unknown; reauth: string | null }[] = [];

const server = setupServer(
  API_CONFIG_MOCKS.auth.me.get.success({
    mockedResponse: ADMIN_MOCKED_RESPONSE,
  }),
  API_CONFIG_MOCKS.auth.reauth.post.success(),
  http.put('/api/v1/orgs/globex', async ({ request }) => {
    sent.push({
      body: await request.json(),
      reauth: request.headers.get('X-DFE-Reauth'),
    });
    return HttpResponse.json({});
  }),
);

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => {
  server.resetHandlers();
  sent.length = 0;
});
afterAll(() => server.close());

const { wrapper } = buildTestWrapper().withReactQuery().withTheme();

describe('EnableDisableOrganisation', () => {
  test('disables from one panel that takes the password', async () => {
    const user = userEvent.setup();
    render(
      <EnableDisableOrganisation
        display_name="Globex"
        enabled
        org_name="globex"
      />,
      { wrapper },
    );

    await user.click(screen.getByRole('button', { name: 'Disable Globex' }));
    expect(await screen.findByText('Disable Globex?')).toBeInTheDocument();
    expect(sent).toEqual([]);

    await user.type(screen.getByLabelText('Your password'), 'pw');
    await user.click(screen.getByRole('button', { name: 'Disable' }));
    await waitFor(() => expect(sent).toHaveLength(1));
    expect(sent[0].body).toEqual({ enabled: false });
    expect(sent[0].reauth).toBeTruthy();
    expect(screen.queryByText("Confirm it's you")).not.toBeInTheDocument();
  });

  test('enables a disabled organisation straight away', async () => {
    const user = userEvent.setup();
    render(
      <EnableDisableOrganisation
        display_name="Globex"
        enabled={false}
        org_name="globex"
      />,
      { wrapper },
    );

    await user.click(screen.getByRole('button', { name: 'Enable Globex' }));
    expect(
      await screen.findByText(
        (_, element) =>
          element?.tagName === 'P' &&
          element.textContent ===
            'You are about to enable organisation globex.',
      ),
    ).toBeInTheDocument();
    await confirmReauth(user);

    await waitFor(() => expect(sent).toHaveLength(1));
    expect(sent[0].body).toEqual({ enabled: true });
    expect(sent[0].reauth).toBeTruthy();
    expect(screen.queryByText('Disable Globex?')).not.toBeInTheDocument();
  });
});
