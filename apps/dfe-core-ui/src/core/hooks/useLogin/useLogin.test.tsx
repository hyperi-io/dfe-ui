import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import {
  afterAll,
  afterEach,
  beforeAll,
  describe,
  expect,
  test,
  vi,
} from 'vitest';
import { useLogin } from '.';
import { LoginRequest, LoginResponse } from './types';
import { server } from './useLogin.mocks';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

beforeAll(() =>
  server.listen({
    onUnhandledRequest: 'error',
  }),
);
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const wrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <QueryClientProvider client={new QueryClient()}>
      {children}
    </QueryClientProvider>
  );
};

describe('.useAuthMe', () => {
  test('should return user', async () => {
    const { result } = renderHook(() => useLogin(), { wrapper });

    result.current.mutate({ username: 'admin', password: 'password' });

    const expectedData: LoginResponse = {
      access_token: 'string',
      token_type: 'bearer',
      expires_in: 0,
      user_id: 'string',
      roles: ['string'],
    };

    await waitFor(() => {
      expect(result.current).toEqual({
        mutate: expect.any(Function) as (data: LoginRequest) => Promise<void>,
        isPending: false,
        error: null,
        data: expectedData,
      });
    });
  });
});
