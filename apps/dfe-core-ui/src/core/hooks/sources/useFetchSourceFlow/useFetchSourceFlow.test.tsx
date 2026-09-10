import { API_CONFIG_MOCKS } from '@/core/config/api/endpoints/generator';
import { buildTestWrapper } from '@/core/utils/test-utils/buildTestWrapper';
import { renderHook, waitFor } from '@testing-library/react';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { useFetchSourceFlow } from '.';
import { server } from './useFetchSourceFlow.mocks';

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const { wrapper } = buildTestWrapper().withReactQuery();

describe('useFetchSourceFlow', () => {
  it('returns the stages the resolver reports', async () => {
    const { result } = renderHook(
      () => useFetchSourceFlow({ source: 'source' }),
      { wrapper },
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.data?.transport).toBe('bus');
    expect(result.current.data?.carrier).toBe('kafka');
    expect(result.current.data?.transform?.instance).toBe(
      'dfe-transform-vrl-source',
    );
    expect(result.current.data?.outputs.loader).toBe('source_load');
    expect(result.current.refusal).toBeNull();
  });

  it('returns a refused flow as its reason rather than an error', async () => {
    server.use(
      API_CONFIG_MOCKS.sources.sourceFlow.get.error({
        mockedResponse: {
          code: 'flow_error',
          message:
            "source 'source' asks to be archived: archive needs the bus transport",
        },
        status: 422,
      }),
    );

    const { result } = renderHook(
      () => useFetchSourceFlow({ source: 'source' }),
      { wrapper },
    );

    await waitFor(() => expect(result.current.refusal).not.toBeNull());

    expect(result.current.refusal).toContain('asks to be archived');
    expect(result.current.error).toBeNull();
  });

  it('does not ask without a source', async () => {
    const { result } = renderHook(() => useFetchSourceFlow({ source: null }), {
      wrapper,
    });

    await waitFor(() => expect(result.current.data).toBeUndefined());
  });
});
