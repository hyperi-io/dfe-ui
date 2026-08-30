import { buildTestWrapper } from '@/core/utils/test-utils/buildTestWrapper';
import { renderHook, waitFor } from '@testing-library/react';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { useFetchApps } from '.';
import { server } from './useFetchApps.mocks';

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const { wrapper } = buildTestWrapper().withReactQuery();

describe('useFetchApps', () => {
  it('returns the catalogue with both multiplicities and their instances', async () => {
    const { result } = renderHook(() => useFetchApps(), { wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    const services = result.current.data?.map((app) => app.service);
    expect(services).toEqual([
      'dfe-receiver',
      'dfe-transform-vrl',
      'dfe-transform-elastic',
    ]);
    expect(result.current.data?.[0].multiplicity).toBe('single');
    expect(result.current.data?.[1].multiplicity).toBe('per_config');
    expect(result.current.data?.[1].instances).toEqual(['syslog']);
  });

  it('carries the file sets an app declares, and the empty set for one that declares none', async () => {
    const { result } = renderHook(() => useFetchApps(), { wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.data?.[1].file_sets[0]).toMatchObject({
      name: 'transforms',
      language: 'vrl',
      suffixes: ['.vrl'],
      reload: 'roll',
    });
    expect(result.current.data?.[2].file_sets).toEqual([]);
  });

  it('flags which apps have routing compiled from the sources', async () => {
    const { result } = renderHook(() => useFetchApps(), { wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.data?.[0].has_compiled_routing).toBe(true);
    expect(result.current.data?.[1].has_compiled_routing).toBe(false);
    expect(result.current.data?.[2].has_compiled_routing).toBe(false);
  });

  it('does not fetch while disabled', async () => {
    const { result } = renderHook(() => useFetchApps({ queryEnabled: false }), {
      wrapper,
    });

    await waitFor(() => expect(result.current.data).toBeUndefined());
  });
});
