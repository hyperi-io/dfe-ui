import { ADMIN_MOCKED_RESPONSE } from '@/core/components/RbacProtected/hooks/hooks.mocks';
import { API_CONFIG_MOCKS } from '@/core/config/api/endpoints/generator';
import { useAuthStore } from '@/core/stores/authStore';
import { buildTestWrapper } from '@/core/utils/test-utils/buildTestWrapper';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll, describe, expect, test } from 'vitest';
import { DeReactivateAccount } from '.';

const sent: { body: unknown; reauth: string | null }[] = [];

const server = setupServer(
  API_CONFIG_MOCKS.auth.me.get.success({
    mockedResponse: ADMIN_MOCKED_RESPONSE,
  }),
  API_CONFIG_MOCKS.auth.reauth.post.success(),
  http.put('/api/v1/auth/accounts/bob', async ({ request }) => {
    sent.push({
      body: await request.json(),
      reauth: request.headers.get('X-DFE-Reauth'),
    });
    return HttpResponse.json({});
  }),
);

beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }));
afterEach(() => {
  server.resetHandlers();
  useAuthStore.getState().reset();
  sent.length = 0;
});
afterAll(() => server.close());

const { wrapper } = buildTestWrapper().withReactQuery().withTheme();

describe('DeReactivateAccount', () => {
  test('asks for the password, then deactivates with the grant', async () => {
    const user = userEvent.setup();
    render(<DeReactivateAccount username="bob" isActive />, { wrapper });

    await user.click(
      await screen.findByRole('button', { name: 'Deactivate Account' }),
    );
    expect(sent).toEqual([]);
    await user.type(await screen.findByLabelText('Your password'), 'pw');
    await user.click(screen.getByRole('button', { name: 'Confirm' }));

    await waitFor(() =>
      expect(sent).toEqual([
        { body: { enabled: false }, reauth: 'reauth-grant' },
      ]),
    );
  });
});
