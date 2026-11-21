import { ADMIN_MOCKED_RESPONSE } from '@/core/components/RbacProtected/hooks/hooks.mocks';
import { API_CONFIG_MOCKS } from '@/core/config/api/endpoints/generator';
import { useAuthStore } from '@/core/stores/authStore';
import { buildTestWrapper } from '@/core/utils/test-utils/buildTestWrapper';
import { confirmReauth } from '@/core/utils/test-utils/confirmReauth';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { DeleteRoleModal } from '.';

const asked: unknown[] = [];
const deleted: { grant: string | null; name: unknown }[] = [];

const server = setupServer(
  API_CONFIG_MOCKS.auth.me.get.success({
    mockedResponse: ADMIN_MOCKED_RESPONSE,
  }),
  http.post('/api/v1/auth/reauth', async ({ request }) => {
    asked.push(await request.json());
    return HttpResponse.json({ expires_in: 600, grant: 'role-grant' });
  }),
  http.delete('/api/v1/auth/roles/:name', ({ params, request }) => {
    deleted.push({
      grant: request.headers.get('X-DFE-Reauth'),
      name: params.name,
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

describe('DeleteRoleModal', () => {
  it('asks for the password on open, then deletes the role with the grant it earned', async () => {
    const user = userEvent.setup();
    render(<DeleteRoleModal role_name="auditor" />, { wrapper });

    await user.click(
      await screen.findByRole('button', { name: 'Delete auditor' }),
    );
    await confirmReauth(user);
    expect(asked).toEqual([
      { kind: 'role', password: 'pw', target: 'auditor' },
    ]);

    await user.type(
      await screen.findByPlaceholderText('Enter role name to be deleted'),
      'auditor',
    );
    await user.click(screen.getByRole('button', { name: 'Delete' }));

    await waitFor(() =>
      expect(deleted).toEqual([{ grant: 'role-grant', name: 'auditor' }]),
    );
  });

  it('opens nothing when the password prompt is cancelled', async () => {
    const user = userEvent.setup();
    render(<DeleteRoleModal role_name="auditor" />, { wrapper });

    await user.click(
      await screen.findByRole('button', { name: 'Delete auditor' }),
    );
    await user.click(await screen.findByRole('button', { name: 'Cancel' }));

    expect(
      screen.queryByPlaceholderText('Enter role name to be deleted'),
    ).not.toBeInTheDocument();
    expect(asked).toEqual([]);
  });
});
