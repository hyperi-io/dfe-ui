import { TAppsResponse } from '@/core/hooks/apps/instances/useFetchApps/types';
import { describe, expect, test } from 'vitest';
import {
  getInitialAssignTransform,
  getTransformEngines,
} from './TransformTabContent.helpers';

const app = (service: string): TAppsResponse[number] => ({
  service,
  scale_deployed: true,
  multiplicity: 'per_config',
  has_compiled_routing: false,
  routing_scope: 'stack',
  optional: false,
  offered: true,
  file_sets: [],
  instances: [],
});

describe('getInitialAssignTransform', () => {
  test('when transform engine is missing, should return none', () => {
    expect(getInitialAssignTransform(undefined)).toBe('none');
    expect(getInitialAssignTransform(null)).toBe('none');
    expect(getInitialAssignTransform({ engine: '' })).toBe('none');
  });

  test('when transform engine is provided, should return define_transform', () => {
    expect(
      getInitialAssignTransform({
        engine: 'vector',
        config_file: null,
      }),
    ).toBe('define_transform');
  });
});

describe('getTransformEngines', () => {
  test('takes the engine name off each catalogued transform app', () => {
    const apps: TAppsResponse = [
      app('dfe-transform-vrl'),
      app('dfe-transform-vector'),
    ];

    expect(getTransformEngines(apps)).toEqual([
      { engine: 'vector', service: 'dfe-transform-vector' },
      { engine: 'vrl', service: 'dfe-transform-vrl' },
    ]);
  });

  test('leaves out the apps that are not transforms', () => {
    const apps: TAppsResponse = [
      app('dfe-receiver'),
      app('dfe-fetcher'),
      app('dfe-transform-elastic'),
    ];

    expect(getTransformEngines(apps)).toEqual([
      { engine: 'elastic', service: 'dfe-transform-elastic' },
    ]);
  });

  test('is empty when no transform app is catalogued', () => {
    expect(getTransformEngines([app('dfe-loader')])).toEqual([]);
    expect(getTransformEngines(undefined)).toEqual([]);
  });
});
