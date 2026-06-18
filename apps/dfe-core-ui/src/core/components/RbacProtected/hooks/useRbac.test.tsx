import { API_CONFIG_MOCKS } from '@/core/config/api/endpoints/endpoints.generator.mocks';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
} from 'vitest';
import { ADMIN_MOCKED_RESPONSE, server } from './hooks.mocks';
import { UI_DISPLAY_ACTIONS } from './rbac.constants';
import { useRbac } from './useRbac';

beforeAll(() =>
  server.listen({
    onUnhandledRequest: 'error',
  }),
);
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={new QueryClient()}>
    {children}
  </QueryClientProvider>
);

describe('useRbac', () => {
  describe('when the user has the required permission for the action', () => {
    it('should return true', async () => {
      const { result } = renderHook(
        () =>
          useRbac({
            action: UI_DISPLAY_ACTIONS.schemas_write,
          }),
        { wrapper },
      );
      await waitFor(() => {
        expect(result.current.isAuthorized).toBe(true);
      });
    });
  });

  describe('when the user does not have the required permission for the action', () => {
    beforeEach(() => {
      server.use(
        API_CONFIG_MOCKS.auth.me.get.success({
          mockedResponse: {
            ...ADMIN_MOCKED_RESPONSE,
            permissions: [],
          },
        }),
      );
    });
    it('should return false', async () => {
      const { result } = renderHook(
        () =>
          useRbac({
            action: UI_DISPLAY_ACTIONS.schemas_write,
          }),
        { wrapper },
      );

      await waitFor(() => {
        expect(result.current.isAuthorized).toBe(false);
      });
    });
  });
});
