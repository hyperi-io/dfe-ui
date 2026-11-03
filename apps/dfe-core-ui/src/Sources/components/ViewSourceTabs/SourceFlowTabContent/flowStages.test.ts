import type { TSourceFlow } from '@/core/hooks/sources/useFetchSourceFlow/types';
import { describe, expect, it } from 'vitest';
import { flowStages, lagText } from './flowStages';

const busFlow: TSourceFlow = {
  source: 'auth',
  transport: 'bus',
  carrier: 'kafka',
  origin: 'receiver',
  input: 'tags.collector.type equals auth',
  transform: {
    engine: 'vrl',
    app: 'dfe-transform-vrl',
    instance: 'dfe-transform-vrl-auth',
    variant: null,
    endpoint: null,
    topics: ['auth_land', 'auth_load'],
  },
  outputs: { loader: 'auth_load', archive: true },
  table: 'auth',
};

describe('flowStages', () => {
  it('draws input, transform and output in the order records travel', () => {
    const { stages } = flowStages(busFlow);

    expect(stages.map((stage) => stage.stage)).toEqual([
      'Input',
      'Transform',
      'Output',
    ]);
  });

  it('takes every topic off the resolver rather than rebuilding the convention', () => {
    const { stages, arrows } = flowStages(busFlow);

    expect(stages[1].details).toContainEqual({
      label: 'Reads',
      value: 'auth_land',
      code: true,
    });
    expect(arrows).toEqual(['kafka auth_land', 'kafka auth_load']);
  });

  it('labels the arrows with the endpoint on the direct transport', () => {
    const { arrows } = flowStages({
      ...busFlow,
      transport: 'direct',
      carrier: 'grpc',
      transform: {
        ...busFlow.transform!,
        endpoint: 'http://dfe-transform-vrl-auth:6000',
        topics: null,
      },
      outputs: { loader: 'http://dfe-loader:6000', archive: false },
    });

    expect(arrows).toEqual([
      'grpc http://dfe-transform-vrl-auth:6000',
      'grpc http://dfe-loader:6000',
    ]);
  });

  it('shows the transform stage as absent when the source has none', () => {
    const { stages, arrows } = flowStages({ ...busFlow, transform: null });

    expect(stages[1].absent).toBe(true);
    expect(arrows[0]).toBeUndefined();
  });

  it('marks the stages the engine derives as read-only', () => {
    const fetched = flowStages({
      ...busFlow,
      origin: 'fetcher',
      input: 'dfe-fetcher-auth',
    });

    expect(fetched.stages[0].engineOwned).toBe(true);
    expect(fetched.stages[1].engineOwned).toBe(true);
    expect(fetched.stages[2].engineOwned).toBeUndefined();
  });

  it('links an engine-owned stage to where its instance is managed', () => {
    const { stages } = flowStages(busFlow);

    expect(stages[1].href).toContain('dfe-transform-vrl');
    expect(stages[1].href).toContain('auth');
  });

  it('says whether the raw record is kept', () => {
    expect(flowStages(busFlow).stages[2].details).toContainEqual({
      label: 'Archive',
      value: 'kept',
    });
  });

  it("draws the customer's own transform with its group and lag, and no app link", () => {
    const { stages } = flowStages(
      {
        ...busFlow,
        transform: {
          engine: 'external',
          app: null,
          instance: null,
          variant: null,
          endpoint: null,
          topics: ['auth_land', 'auth_load'],
          consumer_group: 'dfe-external-auth',
        },
      },
      { lag: 3, committed: true, error: null },
    );

    expect(stages[1].title).toBe('Your own pipeline');
    expect(stages[1].href).toBeUndefined();
    expect(stages[1].engineOwned).toBeFalsy();
    expect(stages[1].details).toContainEqual({
      label: 'Group',
      value: 'dfe-external-auth',
      code: true,
    });
    expect(stages[1].details).toContainEqual({
      label: 'Lag',
      value: '3 records behind',
    });
  });

  it('names the topic an external origin writes', () => {
    const { stages } = flowStages({
      ...busFlow,
      origin: 'external',
      input: 'auth_land',
      transform: null,
    });

    expect(stages[0].title).toBe('Your pipeline writes auth_land');
  });
});

describe('lagText', () => {
  it.each([
    ['still reading', undefined, 'reading'],
    ['one record', { lag: 1, committed: true, error: null }, '1 record behind'],
    [
      'never committed',
      { lag: 5, committed: false, error: null },
      '5 records behind, nothing committed yet',
    ],
    [
      'broker unreachable',
      { lag: null, committed: null, error: 'broker unreachable' },
      'broker unreachable',
    ],
    ['no reason given', { lag: null, committed: null }, 'not read'],
  ])('%s', (_name, partial, expected) => {
    expect(lagText(partial)).toBe(expected);
  });
});
