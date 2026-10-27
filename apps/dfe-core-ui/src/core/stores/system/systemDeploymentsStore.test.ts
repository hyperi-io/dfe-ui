import { TSystemDeploymentResponse } from '@/core/hooks/useFetchDeployment/types';
import { useSystemDeploymentStore } from '@/core/stores/system/systemDeploymentStore';
import { afterEach, describe, expect, test } from 'vitest';

afterEach(() => {
  useSystemDeploymentStore.getState().reset();
});

describe('useSystemDeploymentStore', () => {
  test('setDeployment writes and reset clears', () => {
    const deployment: TSystemDeploymentResponse = {
      profile: 'single-kafka',
      transports: {
        default: 'kafka',
        available: ['kafka', 'grpc'],
      },
      mesh: {
        enabled: true,
        namespace: 'default',
      },
      applies_routing: true,
      stack: 'stack',
      engine: 'MergeTree',
      ui: 'ui',
      apps: {
        app1: 'app1',
        app2: 'app2',
      },
      source: 'deployment',
      backing: {
        backing1: {
          managed_by: 'provider',
          provider: 'provider1',
          tier: 'tier1',
          region: 'region1',
        },
        backing2: {
          managed_by: 'dfe',
          provider: 'provider2',
          tier: 'tier2',
          region: 'region2',
        },
      },
    };

    useSystemDeploymentStore.getState().setDeployment(deployment);
    expect(useSystemDeploymentStore.getState().deployment).toEqual(deployment);

    useSystemDeploymentStore.getState().reset();
    expect(useSystemDeploymentStore.getState().deployment).toBeNull();
  });
});
