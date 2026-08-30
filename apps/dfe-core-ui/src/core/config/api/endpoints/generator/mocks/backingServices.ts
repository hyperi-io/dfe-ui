import { TBackingServicesResponse } from '@/Apps/hooks/backingServices/useFetchBackingServices/types';
import { TUpdateBackingServiceVarResponse } from '@/Apps/hooks/backingServices/useUpdateBackingServiceVar/types';
import { http, HttpResponse } from 'msw';
import {
  DEFAULT_VALIDATION_ERROR,
  TValidationError,
} from './endpoints.generator.mocks.types';

const undeclared = { value: null, source: null, protected: false };

const declared = (value: unknown, isProtected = false) => ({
  value,
  source: 'clickhouse-cluster',
  protected: isProtected,
});

/**
 * Both declaration states on purpose: ClickHouse fully declared with its
 * storage locked, Kafka declaring nothing at all so every value falls to the
 * tier default the engine cannot see.
 */
const DEFAULT_BACKING_SERVICES: TBackingServicesResponse = [
  {
    service: 'clickhouse',
    chart: 'clickhouse-cluster',
    overlay: 'clickhouse-cluster.yaml',
    mode: declared('cluster', true),
    storage_model: declared('s3backed', true),
    replicas: declared(3),
    storage_size: declared('100Gi', true),
    storage_class: declared('local-path', true),
    resources: {
      'resources.requests.cpu': declared('2'),
      'resources.requests.memory': declared('8Gi'),
      'resources.limits.cpu': undeclared,
      'resources.limits.memory': undeclared,
    },
  },
  {
    service: 'kafka',
    chart: 'kafka',
    overlay: 'kafka.yaml',
    mode: undeclared,
    storage_model: undeclared,
    replicas: undeclared,
    storage_size: undeclared,
    storage_class: undeclared,
    resources: {
      'resources.requests.cpu': undeclared,
      'resources.requests.memory': undeclared,
      'resources.limits.cpu': undeclared,
      'resources.limits.memory': undeclared,
    },
  },
];

const DEFAULT_WRITE_RESULT = {
  changed: true,
  commit_sha: 'abc1234',
  auto_merged: true,
  review_required: false,
  pr_url: null,
};

export const backingServices = {
  default: {
    mockedUrl: '/api/v1/backing-services',
    get: {
      success: ({
        mockedResponse = DEFAULT_BACKING_SERVICES,
      }: { mockedResponse?: TBackingServicesResponse } = {}) =>
        http.get(backingServices.default.mockedUrl, () =>
          HttpResponse.json(mockedResponse),
        ),
      error: ({
        mockedResponse = DEFAULT_VALIDATION_ERROR,
        status = 500,
      }: { mockedResponse?: TValidationError; status?: number } = {}) =>
        http.get(backingServices.default.mockedUrl, () =>
          HttpResponse.json(mockedResponse, { status }),
        ),
    },
  },
  overlayVar: {
    mockedUrl: '/api/v1/backing-services/overlays/{name}/vars/{path}',
    put: {
      success: ({
        mockedResponse = DEFAULT_WRITE_RESULT,
        name = 'name',
        path = 'path',
      }: {
        mockedResponse?: TUpdateBackingServiceVarResponse;
        name?: string;
        path?: string;
      } = {}) =>
        http.put(
          backingServices.overlayVar.mockedUrl
            .replace('{name}', name)
            .replace('{path}', path),
          () => HttpResponse.json(mockedResponse),
        ),
      error: ({
        mockedResponse = DEFAULT_VALIDATION_ERROR,
        status = 403,
        name = 'name',
        path = 'path',
      }: {
        mockedResponse?: TValidationError;
        status?: number;
        name?: string;
        path?: string;
      } = {}) =>
        http.put(
          backingServices.overlayVar.mockedUrl
            .replace('{name}', name)
            .replace('{path}', path),
          () => HttpResponse.json(mockedResponse, { status }),
        ),
    },
  },
};
