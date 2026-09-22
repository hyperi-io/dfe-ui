import { buildTestWrapper } from '@/core/utils/test-utils/buildTestWrapper';
import { renderHook, waitFor } from '@testing-library/react';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { useFetchApps } from '.';
import { TAppCatalogueEntry } from './types';
import { server } from './useFetchApps.mocks';

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const { wrapper } = buildTestWrapper().withReactQuery();

/**
 * One app by name.
 *
 * Addressed by service rather than by position: the catalogue is the engine's
 * to order and to add to, so an index here would make a new app a test failure.
 */
const app = (
  apps: TAppCatalogueEntry[] | undefined,
  service: string,
): TAppCatalogueEntry => {
  const found = apps?.find((entry) => entry.service === service);
  if (!found) throw new Error(`${service} is not in the mocked catalogue`);
  return found;
};

describe('useFetchApps', () => {
  it('returns the catalogue with both multiplicities and their instances', async () => {
    const { result } = renderHook(() => useFetchApps(), { wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    const services = result.current.data?.map((entry) => entry.service);
    expect(services).toEqual([
      'dfe-receiver',
      'dfe-transform-vrl',
      'dfe-transform-elastic',
      'dfe-transform-vector',
      'dfe-fetcher',
      'culvert',
    ]);
    expect(app(result.current.data, 'dfe-receiver').multiplicity).toBe(
      'single',
    );
    const vrl = app(result.current.data, 'dfe-transform-vrl');
    expect(vrl.multiplicity).toBe('per_config');
    expect(vrl.instances).toEqual(['syslog']);
  });

  it('carries the routing scope and the source families off the manifest', async () => {
    const { result } = renderHook(() => useFetchApps(), { wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    const receiver = app(result.current.data, 'dfe-receiver');
    expect(receiver.routing_scope).toBe('stack');
    expect(receiver.source_types).toBeUndefined();
    const fetcher = app(result.current.data, 'dfe-fetcher');
    expect(fetcher.routing_scope).toBe('instance');
    expect(fetcher.source_types).toEqual(['crates_io', 'okta', 'aws']);
  });

  it('names the engine a source writes to select a transform, and nothing else', async () => {
    const { result } = renderHook(() => useFetchApps(), { wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(app(result.current.data, 'dfe-transform-vrl').transform_engine).toBe(
      'vrl',
    );
    expect(
      app(result.current.data, 'dfe-transform-vector').transform_engine,
    ).toBe('vector');
    // A fetcher is per-source too, and it is not a transform.
    expect(
      app(result.current.data, 'dfe-fetcher').transform_engine,
    ).toBeUndefined();
  });

  it('carries the file sets an app declares, and the empty set for one that declares none', async () => {
    const { result } = renderHook(() => useFetchApps(), { wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(
      app(result.current.data, 'dfe-transform-vrl').file_sets[0],
    ).toMatchObject({
      name: 'transforms',
      language: 'vrl',
      suffixes: ['.vrl'],
      reload: 'roll',
    });
    expect(app(result.current.data, 'dfe-transform-elastic').file_sets).toEqual(
      [],
    );
  });

  it('says which apps a deployment runs without, and where they may be deployed', async () => {
    const { result } = renderHook(() => useFetchApps(), { wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    const optional = result.current.data?.filter((entry) => entry.optional);
    expect(optional?.map((entry) => entry.service)).toEqual([
      'dfe-transform-vector',
      'culvert',
    ]);
    const culvert = app(result.current.data, 'culvert');
    expect(culvert.profiles).toEqual(['scale', 'scale-mesh']);
    expect(culvert.default_in).toEqual([]);
    expect(culvert.offered).toBe(false);
  });

  it('flags which apps have routing compiled from the sources', async () => {
    const { result } = renderHook(() => useFetchApps(), { wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(app(result.current.data, 'dfe-receiver').has_compiled_routing).toBe(
      true,
    );
    expect(
      app(result.current.data, 'dfe-transform-vrl').has_compiled_routing,
    ).toBe(true);
    expect(app(result.current.data, 'culvert').has_compiled_routing).toBe(
      false,
    );
  });

  it('does not fetch while disabled', async () => {
    const { result } = renderHook(() => useFetchApps({ queryEnabled: false }), {
      wrapper,
    });

    await waitFor(() => expect(result.current.data).toBeUndefined());
  });
});
