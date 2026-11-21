import { API_CONFIG_MOCKS } from '@/core/config/api/endpoints/generator';
import { buildTestWrapper } from '@/core/utils/test-utils/buildTestWrapper';
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
import { useUnlinkIdentity } from '.';
import { server } from './useUnlinkIdentity.mocks';

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const { wrapper } = buildTestWrapper().withReactQuery();

describe('.useUnlinkIdentity', () => {
  test('unlinks the sign-in and calls onSuccess', async () => {
    const onSuccess = vi.fn();
    const { result } = renderHook(
      () => useUnlinkIdentity({ onSuccess, username: 'kaz' }),
      { wrapper },
    );

    result.current.mutate({ key: 'stub-kaz', reauth: 'grant' });

    await waitFor(() => expect(onSuccess).toHaveBeenCalled());
    expect(result.current.error).toBeNull();
  });

  test('a refusal surfaces its error and skips onSuccess', async () => {
    server.use(
      API_CONFIG_MOCKS.accounts.identity.delete.error({
        key: 'stub-kaz',
        mockedResponse: {
          type: 'about:blank',
          title: 'Conflict',
          status: 409,
          detail:
            "Cannot unlink 'stub-kaz' from 'kaz': it gives the last usable account its system admin role",
        },
        status: 409,
        username: 'kaz',
      }),
    );
    const onSuccess = vi.fn();
    const { result } = renderHook(
      () => useUnlinkIdentity({ onSuccess, username: 'kaz' }),
      { wrapper },
    );

    result.current.mutate({ key: 'stub-kaz', reauth: 'grant' });

    await waitFor(() =>
      expect(result.current.error?.message).toMatch(/last usable account/),
    );
    expect(onSuccess).not.toHaveBeenCalled();
  });
});
