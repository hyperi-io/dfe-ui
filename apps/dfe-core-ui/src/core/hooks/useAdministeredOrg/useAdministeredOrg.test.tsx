import { API_CONFIG_MOCKS } from '@/core/config/api/endpoints/generator';
import { TAuthMeResponse } from '@/core/hooks/useAuthMe/types';
import { useAuthStore } from '@/core/stores/authStore';
import { buildTestWrapper } from '@/core/utils/test-utils/buildTestWrapper';
import { renderHook, waitFor } from '@testing-library/react';
import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll, describe, expect, test } from 'vitest';
import { useAdministeredOrg } from '.';

const server = setupServer();

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => {
  server.resetHandlers();
  useAuthStore.getState().reset();
});
afterAll(() => server.close());

const { wrapper } = buildTestWrapper().withReactQuery();

const me = (fields: Partial<TAuthMeResponse>): TAuthMeResponse => ({
  org_id: 'acme',
  user_id: 'kim',
  roles: [],
  permissions: [],
  groups: [],
  external: false,
  blocked: false,
  disabled_at: '',
  blocked_at: '',
  password_change_required: false,
  hyperdx_role: '',
  hyperdx_identity: '',
  ...fields,
});

describe('useAdministeredOrg', () => {
  test.each<{
    expected: string | undefined;
    fields: Partial<TAuthMeResponse>;
    name: string;
  }>([
    {
      name: 'an org admin administers the org it is bound to',
      fields: { roles: ['org_admin'], permissions: ['account:write'] },
      expected: 'acme',
    },
    {
      name: 'an admin who reads every org administers no one org',
      fields: { roles: ['org_admin', 'admin'], permissions: ['*'] },
      expected: undefined,
    },
    {
      name: 'a viewer administers no org',
      fields: { roles: ['org_viewer'], permissions: ['query:execute'] },
      expected: undefined,
    },
    {
      name: 'an org admin bound to no org administers none',
      fields: { org_id: '', roles: ['org_admin'], permissions: [] },
      expected: undefined,
    },
  ])('$name', async ({ expected, fields }) => {
    server.use(
      API_CONFIG_MOCKS.auth.me.get.success({ mockedResponse: me(fields) }),
    );
    const { result } = renderHook(() => useAdministeredOrg(), { wrapper });
    await waitFor(() => expect(useAuthStore.getState().me).not.toBeNull());
    await waitFor(() => expect(result.current).toBe(expected));
  });
});
