import { ADMIN_MOCKED_RESPONSE } from '@/core/components/RbacProtected/hooks/hooks.mocks';
import { API_CONFIG_MOCKS } from '@/core/config/api/endpoints/generator';
import { useAuthStore } from '@/core/stores/authStore';
import { buildTestWrapper } from '@/core/utils/test-utils/buildTestWrapper';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { RevokeApiKeyModal } from '.';

const asked: unknown[] = [];
const deleted: { grant: string | null; id: unknown }[] = [];

const server = setupServer(
  API_CONFIG_MOCKS.auth.me.get.success({
    mockedResponse: ADMIN_MOCKED_RESPONSE,
  }),
  http.post('/api/v1/auth/reauth', async ({ request }) => {
    asked.push(await request.json());
    return HttpResponse.json({ expires_in: 600, grant: 'api_key-grant' });
  }),
  http.delete('/api/v1/auth/api-keys/:short_token', ({ params, request }) => {
    deleted.push({
      grant: request.headers.get('X-DFE-Reauth'),
      id: params.short_token,
    });
    return new HttpResponse(null, { status: 204 });
  }),
);

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => {
  asked.length = 0;
  deleted.length = 0;
  useAuthStore.getState().reset();
});
afterAll(() => server.close());

const { wrapper } = buildTestWrapper().withTheme().withReactQuery();

describe('RevokeApiKeyModal', () => {
  it('revokes from one panel that takes the password, with no name to type', async () => {
    const user = userEvent.setup();
    render(<RevokeApiKeyModal name="ci-deploy" shortToken="abc123" />, {
      wrapper,
    });

    await user.click(
      await screen.findByRole('button', { name: 'Revoke API Key' }),
    );
    expect(await screen.findByText('Revoke ci-deploy?')).toBeInTheDocument();
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();

    await user.type(screen.getByLabelText('Your password'), 'pw');
    await user.click(
      within(screen.getByRole('dialog')).getByRole('button', {
        name: 'Revoke API Key',
      }),
    );

    await waitFor(() =>
      expect(deleted).toEqual([{ grant: 'api_key-grant', id: 'abc123' }]),
    );
    expect(asked).toEqual([
      { kind: 'api_key', password: 'pw', target: 'abc123' },
    ]);
  });

  it('revokes nothing when the panel is cancelled', async () => {
    const user = userEvent.setup();
    render(<RevokeApiKeyModal name="ci-deploy" shortToken="abc123" />, {
      wrapper,
    });

    await user.click(
      await screen.findByRole('button', { name: 'Revoke API Key' }),
    );
    await user.click(await screen.findByRole('button', { name: 'Cancel' }));

    expect(asked).toEqual([]);
    expect(deleted).toEqual([]);
  });
});
