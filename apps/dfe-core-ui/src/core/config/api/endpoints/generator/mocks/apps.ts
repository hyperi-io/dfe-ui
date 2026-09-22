import { TAppFileDetail } from '@/core/hooks/apps/files/useFetchAppFile/types';
import { TAppFilesResponse } from '@/core/hooks/apps/files/useFetchAppFiles/types';
import { TAppFileLinksResponse } from '@/core/hooks/apps/files/useFetchAppFileLinks/types';
import { TCopyAppFilesResponse } from '@/core/hooks/apps/files/useCopyAppFiles/types';
import { TDeleteAppFileResponse } from '@/core/hooks/apps/files/useDeleteAppFile/types';
import { TDryRunAppFileResponse } from '@/core/hooks/apps/files/useDryRunAppFile/types';
import { TLinkAppFileResponse } from '@/core/hooks/apps/files/useLinkAppFile/types';
import { TRelinkAppFilesResponse } from '@/core/hooks/apps/files/useRelinkAppFiles/types';
import { TUpdateAppFileResponse } from '@/core/hooks/apps/files/useUpdateAppFile/types';
import { TCreateAppInstanceResponse } from '@/core/hooks/apps/instances/useCreateAppInstance/types';
import { TDeleteAppInstanceResponse } from '@/core/hooks/apps/instances/useDeleteAppInstance/types';
import { TAppConfigResponse } from '@/core/hooks/apps/config/useFetchAppConfig/types';
import { TUpdateAppConfigResponse } from '@/core/hooks/apps/config/useUpdateAppConfig/types';
import { TAppDetailResponse } from '@/core/hooks/apps/instances/useFetchAppDetail/types';
import { TAppHistoryResponse } from '@/core/hooks/apps/instances/useFetchAppHistory/types';
import { TAppsResponse } from '@/core/hooks/apps/instances/useFetchApps/types';
import { TAppMetricsResponse } from '@/core/hooks/apps/operations/useFetchAppMetrics/types';
import { TAppResourceSeriesResponse } from '@/core/hooks/apps/operations/useFetchAppResourceSeries/types';
import { TAppStatusResponse } from '@/core/hooks/apps/operations/useFetchAppStatus/types';
import { TAppRoutingResponse } from '@/core/hooks/apps/routing/useFetchAppRouting/types';
import { TSyncAppRoutingResponse } from '@/core/hooks/apps/routing/useSyncAppRouting/types';
import { TAppScalingResponse } from '@/core/hooks/apps/scaling/useFetchAppScaling/types';
import { TUpdateAppScalingResponse } from '@/core/hooks/apps/scaling/useUpdateAppScaling/types';
import { http, HttpResponse } from 'msw';
import {
  DEFAULT_VALIDATION_ERROR,
  TValidationError,
} from './endpoints.generator.mocks.types';

/**
 * A default catalogue that carries all six app shapes on purpose: a single app
 * with stack-scoped compiled routing, a transform with file sets, a transform
 * with none, a transform this profile is not offered, the instance-scoped app
 * that declares the fetcher source families, and an optional single app this
 * profile is not offered. A UI that special-cases an app name fails against
 * this.
 *
 * The transforms carry the engine names and the instance routing scope the
 * engine reports for them, so a surface reading either against these mocks
 * reads what it will read against a deployment.
 */
const DEFAULT_APPS: TAppsResponse = [
  {
    service: 'dfe-receiver',
    scale_deployed: true,
    multiplicity: 'single',
    has_compiled_routing: true,
    routing_scope: 'stack',
    optional: false,
    offered: true,
    file_sets: [],
    instances: ['default'],
  },
  {
    service: 'dfe-transform-vrl',
    scale_deployed: true,
    multiplicity: 'per_config',
    has_compiled_routing: true,
    routing_scope: 'instance',
    optional: false,
    offered: true,
    transform_engine: 'vrl',
    file_sets: [
      {
        name: 'transforms',
        language: 'vrl',
        suffixes: ['.vrl'],
        reload: 'roll',
        directory_setting: 'config.transforms.dir',
      },
    ],
    instances: ['syslog'],
  },
  {
    service: 'dfe-transform-elastic',
    scale_deployed: true,
    multiplicity: 'per_config',
    has_compiled_routing: true,
    routing_scope: 'instance',
    optional: false,
    offered: true,
    transform_engine: 'elastic',
    file_sets: [],
    instances: [],
  },
  {
    service: 'dfe-transform-vector',
    scale_deployed: true,
    multiplicity: 'per_config',
    has_compiled_routing: true,
    routing_scope: 'instance',
    optional: true,
    default_in: [],
    offered: false,
    transform_engine: 'vector',
    file_sets: [
      {
        name: 'transforms',
        language: 'yaml',
        suffixes: ['.yaml', '.yml'],
        reload: 'hot',
        directory_setting: 'config.transforms.dir',
      },
    ],
    instances: [],
  },
  {
    service: 'dfe-fetcher',
    scale_deployed: false,
    multiplicity: 'per_config',
    has_compiled_routing: true,
    routing_scope: 'instance',
    optional: false,
    offered: true,
    source_types: ['crates_io', 'okta', 'aws'],
    file_sets: [],
    instances: [],
  },
  {
    service: 'culvert',
    scale_deployed: false,
    multiplicity: 'single',
    has_compiled_routing: false,
    routing_scope: 'stack',
    optional: true,
    profiles: ['scale', 'scale-mesh'],
    default_in: [],
    offered: false,
    file_sets: [],
    instances: [],
  },
];

/**
 * A contract carrying every provenance the engine reports, plus each control
 * the declared types resolve to. A console that folds `chart` into `default`,
 * or renders a secret's value, fails against this.
 */
const DEFAULT_APP_CONFIG: TAppConfigResponse = {
  etag: 'aaaaaaa1111',
  available: true,
  fields: [
    {
      path: 'config.batch.max_records',
      type: 'integer',
      title: 'Maximum records per batch',
      description: 'Records buffered before a flush.',
      secret: false,
      enum: null,
      default: 1000,
      value: 1000,
      provenance: 'default',
      dial: null,
      protected: false,
      set: false,
    },
    {
      path: 'config.batch.timeout_ms',
      type: 'integer',
      title: 'Batch timeout',
      description: 'Milliseconds before a partial batch flushes anyway.',
      secret: false,
      enum: null,
      default: 5000,
      value: 200,
      provenance: 'overlay',
      dial: null,
      protected: false,
      set: true,
    },
    {
      path: 'config.kafka.brokers',
      type: 'array',
      title: 'Kafka brokers',
      description: 'Derived from the deployment kafka mode.',
      secret: false,
      enum: null,
      default: null,
      value: ['kafka-0:9092'],
      provenance: 'chart',
      dial: null,
      protected: false,
      set: true,
    },
    {
      path: 'config.kafka.sasl_password',
      type: 'string',
      title: 'Kafka SASL password',
      description: 'Credential material.',
      secret: true,
      enum: null,
      default: null,
      value: null,
      provenance: 'overlay',
      dial: null,
      protected: true,
      set: true,
    },
    {
      path: 'config.log_level',
      type: 'string',
      title: 'Log level',
      description: 'How much the app says.',
      secret: false,
      enum: ['trace', 'debug', 'info', 'warn', 'error'],
      default: 'info',
      value: 'info',
      provenance: 'default',
      dial: null,
      protected: false,
      set: false,
    },
    {
      path: 'config.tls_enabled',
      type: 'boolean',
      title: 'TLS enabled',
      description: 'Whether the listener terminates TLS.',
      secret: false,
      enum: null,
      default: false,
      value: false,
      provenance: 'unset',
      dial: null,
      protected: false,
      set: false,
    },
  ],
  unknown: [{ path: 'config.retired_option', value: 'left behind' }],
  custom: [{ path: 'extraEnv.RUST_BACKTRACE', value: '1' }],
};

const DEFAULT_WRITE_RESULT = {
  changed: true,
  commit_sha: 'abc1234',
  auto_merged: true,
  review_required: false,
  pr_url: null,
  validation: null,
  reload: 'roll',
};

/**
 * The receiver's derived blocks, keyed by name as the engine sends them.
 *
 * Shape captured from `GET /api/v1/apps/dfe-receiver/default/routing`: the rules
 * are at `routing.source_rules`, not off the top of `compiled`, and the compile
 * writes a sibling `destinations` block. A fixture flattened to `source_rules`
 * passes a UI that reads the wrong depth (dfe-ui#330).
 */
export const RECEIVER_ROUTING_BLOCKS = {
  routing: {
    source_rules: [
      {
        field: 'event.dataset',
        mode: 'key_value_set',
        match_value: 'syslog',
        source: 'syslog',
      },
    ],
    default_source: 'main',
    topic_suffix: '_land',
    source_to_topic: {},
    legacy_compat: false,
    dlq: { enabled: true, topic: 'dlq_land' },
  },
  destinations: { default: 'kafka', rules: [] },
};

/**
 * The loader's derived block, same nesting, no per-source rules.
 *
 * Shape captured from `GET /api/v1/apps/dfe-loader/default/routing`. A
 * whole-app map keyed by source has nothing to say on one source's page, so a
 * UI reading these blocks is right to render nothing for the loader.
 */
export const LOADER_ROUTING_BLOCKS = {
  routing: {
    default_db: 'dfe',
    source_to_table: { main: 'main', syslog: 'syslog' },
  },
};

const withInstance = (url: string, service: string, instance: string) =>
  url.replace('{service}', service).replace('{instance}', instance);

const withFileSet = (
  url: string,
  service: string,
  instance: string,
  setName: string,
) => withInstance(url, service, instance).replace('{set_name}', setName);

export const apps = {
  default: {
    mockedUrl: '/api/v1/apps',
    get: {
      success: ({
        mockedResponse = DEFAULT_APPS,
      }: { mockedResponse?: TAppsResponse } = {}) =>
        http.get(apps.default.mockedUrl, () =>
          HttpResponse.json(mockedResponse),
        ),
      error: ({
        mockedResponse = DEFAULT_VALIDATION_ERROR,
        status = 500,
      }: { mockedResponse?: TValidationError; status?: number } = {}) =>
        http.get(apps.default.mockedUrl, () =>
          HttpResponse.json(mockedResponse, { status }),
        ),
    },
  },
  instances: {
    mockedUrl: '/api/v1/apps/{service}/instances',
    post: {
      success: ({
        mockedResponse = DEFAULT_WRITE_RESULT,
        service = 'service',
      }: {
        mockedResponse?: TCreateAppInstanceResponse;
        service?: string;
      } = {}) =>
        http.post(apps.instances.mockedUrl.replace('{service}', service), () =>
          HttpResponse.json(mockedResponse),
        ),
      error: ({
        mockedResponse = DEFAULT_VALIDATION_ERROR,
        status = 409,
        service = 'service',
      }: {
        mockedResponse?: TValidationError;
        status?: number;
        service?: string;
      } = {}) =>
        http.post(apps.instances.mockedUrl.replace('{service}', service), () =>
          HttpResponse.json(mockedResponse, { status }),
        ),
    },
  },
  app: {
    mockedUrl: '/api/v1/apps/{service}/{instance}',
    get: {
      success: ({
        mockedResponse = {
          service: 'dfe-transform-vrl',
          instance: 'syslog',
          telemetry_name: 'dfe-transform-vrl-syslog',
          scale_deployed: true,
          multiplicity: 'per_config',
          has_compiled_routing: false,
          routing_scope: 'stack',
          optional: false,
          file_sets: [],
        },
        service = 'service',
        instance = 'instance',
      }: {
        mockedResponse?: TAppDetailResponse;
        service?: string;
        instance?: string;
      } = {}) =>
        http.get(withInstance(apps.app.mockedUrl, service, instance), () =>
          HttpResponse.json(mockedResponse),
        ),
    },
    delete: {
      success: ({
        mockedResponse = DEFAULT_WRITE_RESULT,
        service = 'service',
        instance = 'instance',
      }: {
        mockedResponse?: TDeleteAppInstanceResponse;
        service?: string;
        instance?: string;
      } = {}) =>
        http.delete(withInstance(apps.app.mockedUrl, service, instance), () =>
          HttpResponse.json(mockedResponse),
        ),
    },
  },
  config: {
    mockedUrl: '/api/v1/apps/{service}/{instance}/config',
    get: {
      success: ({
        mockedResponse = DEFAULT_APP_CONFIG,
        service = 'service',
        instance = 'instance',
      }: {
        mockedResponse?: TAppConfigResponse;
        service?: string;
        instance?: string;
      } = {}) =>
        http.get(withInstance(apps.config.mockedUrl, service, instance), () =>
          HttpResponse.json(mockedResponse),
        ),
      // A deployment that mounted no contract for the app. Not an empty field
      // list: the engine says so, and the console says so too.
      unavailable: ({
        service = 'service',
        instance = 'instance',
      }: { service?: string; instance?: string } = {}) =>
        http.get(withInstance(apps.config.mockedUrl, service, instance), () =>
          HttpResponse.json({
            etag: null,
            available: false,
            fields: [],
            unknown: [],
            custom: [],
          } satisfies TAppConfigResponse),
        ),
    },
    put: {
      success: ({
        mockedResponse = { ...DEFAULT_WRITE_RESULT, custom_env: '' },
        service = 'service',
        instance = 'instance',
      }: {
        mockedResponse?: TUpdateAppConfigResponse;
        service?: string;
        instance?: string;
      } = {}) =>
        http.put(withInstance(apps.config.mockedUrl, service, instance), () =>
          HttpResponse.json(mockedResponse),
        ),
      // The engine's chart-derived refusal. `path` rides in context, because
      // its handler moves everything outside code and message there, and
      // `errors` stays empty - so a console reading only `errors` loses it.
      chartDerived: ({
        path = 'config.kafka.brokers',
        message = 'the deployment sets this through kafka.mode, which outranks the overlay, so writing it here would change nothing',
        service = 'service',
        instance = 'instance',
      }: {
        path?: string;
        message?: string;
        service?: string;
        instance?: string;
      } = {}) =>
        http.put(withInstance(apps.config.mockedUrl, service, instance), () =>
          HttpResponse.json(
            { code: 'chart_derived', message, errors: [], context: { path } },
            { status: 409 },
          ),
        ),
      chartSetEnv: ({
        path = 'extraEnv.DFE_LOG_LEVEL',
        message = 'the dfe-loader chart sets DFE_LOG_LEVEL itself, for its own logging, and its value is rendered last, so writing it here would change nothing',
        service = 'service',
        instance = 'instance',
      }: {
        path?: string;
        message?: string;
        service?: string;
        instance?: string;
      } = {}) =>
        http.put(withInstance(apps.config.mockedUrl, service, instance), () =>
          HttpResponse.json(
            { code: 'chart_set_env', message, errors: [], context: { path } },
            { status: 409 },
          ),
        ),
      error: ({
        mockedResponse = DEFAULT_VALIDATION_ERROR,
        status = 400,
        service = 'service',
        instance = 'instance',
      }: {
        mockedResponse?: TValidationError;
        status?: number;
        service?: string;
        instance?: string;
      } = {}) =>
        http.put(withInstance(apps.config.mockedUrl, service, instance), () =>
          HttpResponse.json(mockedResponse, { status }),
        ),
    },
  },
  scaling: {
    mockedUrl: '/api/v1/apps/{service}/{instance}/scaling',
    get: {
      success: ({
        mockedResponse = {
          supported: true,
          reason: '',
          deploy_target: 'kubernetes',
          etag: 'aaaaaaa1111',
          replica_count: null,
          min_replicas: 1,
          max_replicas: 10,
          keda_enabled: true,
          cpu_request: '100m',
          memory_request: '256Mi',
          cpu_limit: '500m',
          memory_limit: '512Mi',
        },
        service = 'service',
        instance = 'instance',
      }: {
        mockedResponse?: TAppScalingResponse;
        service?: string;
        instance?: string;
      } = {}) =>
        http.get(withInstance(apps.scaling.mockedUrl, service, instance), () =>
          HttpResponse.json(mockedResponse),
        ),
      kedaOff: ({
        replicaCount = 3,
        service = 'service',
        instance = 'instance',
      }: {
        replicaCount?: number | null;
        service?: string;
        instance?: string;
      } = {}) =>
        http.get(withInstance(apps.scaling.mockedUrl, service, instance), () =>
          HttpResponse.json({
            supported: true,
            reason: '',
            deploy_target: 'kubernetes',
            replica_count: replicaCount,
            min_replicas: null,
            max_replicas: null,
            keda_enabled: false,
            cpu_request: '100m',
            memory_request: '256Mi',
            cpu_limit: '500m',
            memory_limit: '512Mi',
          } satisfies TAppScalingResponse),
        ),
      unsupported: ({
        reason = 'deploy target is docker: Compose has no KEDA, and CPU and memory are set stack-wide rather than per component',
        service = 'service',
        instance = 'instance',
      }: { reason?: string; service?: string; instance?: string } = {}) =>
        http.get(withInstance(apps.scaling.mockedUrl, service, instance), () =>
          HttpResponse.json({
            supported: false,
            reason,
            deploy_target: 'docker',
            replica_count: null,
            min_replicas: null,
            max_replicas: null,
            keda_enabled: null,
            cpu_request: null,
            memory_request: null,
            cpu_limit: null,
            memory_limit: null,
          } satisfies TAppScalingResponse),
        ),
    },
    put: {
      success: ({
        mockedResponse = DEFAULT_WRITE_RESULT,
        service = 'service',
        instance = 'instance',
      }: {
        mockedResponse?: TUpdateAppScalingResponse;
        service?: string;
        instance?: string;
      } = {}) =>
        http.put(withInstance(apps.scaling.mockedUrl, service, instance), () =>
          HttpResponse.json(mockedResponse),
        ),
      error: ({
        mockedResponse = DEFAULT_VALIDATION_ERROR,
        status = 400,
        service = 'service',
        instance = 'instance',
      }: {
        mockedResponse?: TValidationError;
        status?: number;
        service?: string;
        instance?: string;
      } = {}) =>
        http.put(withInstance(apps.scaling.mockedUrl, service, instance), () =>
          HttpResponse.json(mockedResponse, { status }),
        ),
      // The engine's stale-If-Match refusal: a 409 whose context carries the
      // revision to re-read against. Distinct from the review_required 409.
      staleRevision: ({
        message = 'base revision aaaaaaa1111 is stale',
        head = 'bbbbbbb2222',
        current = 'aaaaaaa1111',
        service = 'service',
        instance = 'instance',
      }: {
        message?: string;
        head?: string;
        current?: string;
        service?: string;
        instance?: string;
      } = {}) =>
        http.put(withInstance(apps.scaling.mockedUrl, service, instance), () =>
          HttpResponse.json(
            {
              code: 'conflict',
              message,
              errors: [],
              context: { current, head },
            },
            { status: 409 },
          ),
        ),
    },
  },
  status: {
    mockedUrl: '/api/v1/apps/{service}/{instance}/status',
    get: {
      success: ({
        mockedResponse = {
          telemetry_name: 'dfe-transform-vrl-syslog',
          reporting: true,
          last_seen_epoch: 1756500000,
          started_epoch: 1756400000,
          uptime_seconds: 100000,
        },
        service = 'service',
        instance = 'instance',
      }: {
        mockedResponse?: TAppStatusResponse;
        service?: string;
        instance?: string;
      } = {}) =>
        http.get(withInstance(apps.status.mockedUrl, service, instance), () =>
          HttpResponse.json(mockedResponse),
        ),
      unavailable: ({
        service = 'service',
        instance = 'instance',
      }: { service?: string; instance?: string } = {}) =>
        http.get(withInstance(apps.status.mockedUrl, service, instance), () =>
          HttpResponse.json(
            {
              code: 'metrics_unavailable',
              message: 'the telemetry store is not reachable',
            },
            { status: 503 },
          ),
        ),
    },
  },
  metrics: {
    mockedUrl: '/api/v1/apps/{service}/{instance}/metrics',
    get: {
      success: ({
        mockedResponse = {
          telemetry_name: 'dfe-transform-vrl-syslog',
          window_seconds: 300,
          gauges: { worker_pool_saturation: 0.4 },
          rates: { records_processed_total: 12.5 },
        },
        service = 'service',
        instance = 'instance',
      }: {
        mockedResponse?: TAppMetricsResponse;
        service?: string;
        instance?: string;
      } = {}) =>
        http.get(withInstance(apps.metrics.mockedUrl, service, instance), () =>
          HttpResponse.json(mockedResponse),
        ),
    },
  },
  metricsSeries: {
    mockedUrl: '/api/v1/apps/{service}/{instance}/metrics/series',
    get: {
      success: ({
        mockedResponse = {
          telemetry_name: 'dfe-transform-vrl-syslog',
          window_seconds: 3600,
          bucket_seconds: 60,
          buckets: [],
        },
        service = 'service',
        instance = 'instance',
      }: {
        mockedResponse?: TAppResourceSeriesResponse;
        service?: string;
        instance?: string;
      } = {}) =>
        http.get(
          withInstance(apps.metricsSeries.mockedUrl, service, instance),
          () => HttpResponse.json(mockedResponse),
        ),
    },
  },
  history: {
    mockedUrl: '/api/v1/apps/{service}/{instance}/history',
    get: {
      success: ({
        mockedResponse = [
          {
            sha: 'abc1234',
            timestamp: 1756500000,
            actor: 'derek',
            summary: 'set scaling dials',
            state: 'committed',
          },
        ],
        service = 'service',
        instance = 'instance',
      }: {
        mockedResponse?: TAppHistoryResponse;
        service?: string;
        instance?: string;
      } = {}) =>
        http.get(withInstance(apps.history.mockedUrl, service, instance), () =>
          HttpResponse.json(mockedResponse),
        ),
    },
  },
  routing: {
    mockedUrl: '/api/v1/apps/{service}/{instance}/routing',
    get: {
      success: ({
        mockedResponse = {
          compiler: 'receiver',
          // An app owns each derived block whole, so a compile writes more than
          // one of them; the receiver's rules and its destinations are siblings.
          values_paths: {
            routing: 'config.routing',
            destinations: 'config.destinations',
          },
          drift: false,
          absent: false,
          compiled: RECEIVER_ROUTING_BLOCKS,
          deployed: RECEIVER_ROUTING_BLOCKS,
          etag: 'abc1234',
        },
        service = 'service',
        instance = 'instance',
      }: {
        mockedResponse?: TAppRoutingResponse;
        service?: string;
        instance?: string;
      } = {}) =>
        http.get(withInstance(apps.routing.mockedUrl, service, instance), () =>
          HttpResponse.json(mockedResponse),
        ),
    },
  },
  routingSync: {
    mockedUrl: '/api/v1/apps/{service}/{instance}/routing/sync',
    post: {
      success: ({
        mockedResponse = DEFAULT_WRITE_RESULT,
        service = 'service',
        instance = 'instance',
      }: {
        mockedResponse?: TSyncAppRoutingResponse;
        service?: string;
        instance?: string;
      } = {}) =>
        http.post(
          withInstance(apps.routingSync.mockedUrl, service, instance),
          () => HttpResponse.json(mockedResponse),
        ),
    },
  },
  files: {
    mockedUrl: '/api/v1/apps/{service}/{instance}/files/{set_name}',
    get: {
      success: ({
        mockedResponse = [
          { name: '000_parse.vrl', language: 'vrl', size_bytes: 42 },
        ],
        service = 'service',
        instance = 'instance',
        setName = 'set_name',
      }: {
        mockedResponse?: TAppFilesResponse;
        service?: string;
        instance?: string;
        setName?: string;
      } = {}) =>
        http.get(
          withFileSet(apps.files.mockedUrl, service, instance, setName),
          () => HttpResponse.json(mockedResponse),
        ),
    },
  },
  file: {
    mockedUrl: '/api/v1/apps/{service}/{instance}/files/{set_name}/{filename}',
    get: {
      success: ({
        mockedResponse = {
          name: '000_parse.vrl',
          language: 'vrl',
          size_bytes: 42,
          content: '. = parse_json!(.message)',
        },
        service = 'service',
        instance = 'instance',
        setName = 'set_name',
        filename = 'filename',
      }: {
        mockedResponse?: TAppFileDetail;
        service?: string;
        instance?: string;
        setName?: string;
        filename?: string;
      } = {}) =>
        http.get(
          withFileSet(apps.file.mockedUrl, service, instance, setName).replace(
            '{filename}',
            filename,
          ),
          () => HttpResponse.json(mockedResponse),
        ),
    },
    put: {
      success: ({
        mockedResponse = {
          ...DEFAULT_WRITE_RESULT,
          validation: {
            status: 'valid',
            backend: 'vrl',
            message: '',
            errors: [],
          },
        },
        service = 'service',
        instance = 'instance',
        setName = 'set_name',
        filename = 'filename',
      }: {
        mockedResponse?: TUpdateAppFileResponse;
        service?: string;
        instance?: string;
        setName?: string;
        filename?: string;
      } = {}) =>
        http.put(
          withFileSet(apps.file.mockedUrl, service, instance, setName).replace(
            '{filename}',
            filename,
          ),
          () => HttpResponse.json(mockedResponse),
        ),
      error: ({
        mockedResponse = DEFAULT_VALIDATION_ERROR,
        status = 400,
        service = 'service',
        instance = 'instance',
        setName = 'set_name',
        filename = 'filename',
      }: {
        mockedResponse?: TValidationError;
        status?: number;
        service?: string;
        instance?: string;
        setName?: string;
        filename?: string;
      } = {}) =>
        http.put(
          withFileSet(apps.file.mockedUrl, service, instance, setName).replace(
            '{filename}',
            filename,
          ),
          () => HttpResponse.json(mockedResponse, { status }),
        ),
    },
    delete: {
      success: ({
        mockedResponse = DEFAULT_WRITE_RESULT,
        service = 'service',
        instance = 'instance',
        setName = 'set_name',
        filename = 'filename',
      }: {
        mockedResponse?: TDeleteAppFileResponse;
        service?: string;
        instance?: string;
        setName?: string;
        filename?: string;
      } = {}) =>
        http.delete(
          withFileSet(apps.file.mockedUrl, service, instance, setName).replace(
            '{filename}',
            filename,
          ),
          () => HttpResponse.json(mockedResponse),
        ),
    },
  },
  fileCopy: {
    mockedUrl: '/api/v1/apps/{service}/{instance}/files/{set_name}/copy',
    post: {
      success: ({
        mockedResponse = {
          ...DEFAULT_WRITE_RESULT,
          copied: ['000_parse.vrl'],
          skipped: [],
        },
        service = 'service',
        instance = 'instance',
        setName = 'set_name',
      }: {
        mockedResponse?: TCopyAppFilesResponse;
        service?: string;
        instance?: string;
        setName?: string;
      } = {}) =>
        http.post(
          withFileSet(apps.fileCopy.mockedUrl, service, instance, setName),
          () => HttpResponse.json(mockedResponse),
        ),
    },
  },
  fileDryRun: {
    mockedUrl: '/api/v1/apps/{service}/{instance}/files/{set_name}/dry-run',
    post: {
      success: ({
        mockedResponse = {
          status: 'completed',
          backend: 'vrl',
          message: '',
          source: 'syslog',
          sampled: 1,
          succeeded: 1,
          failed: 0,
          dropped: 0,
          truncated: false,
          events: [
            {
              index: 0,
              before: '{"message":"hello"}',
              after: '{"message":"hello","parsed":true}',
              error: '',
              dropped: false,
              changed: true,
            },
          ],
        },
        service = 'service',
        instance = 'instance',
        setName = 'set_name',
      }: {
        mockedResponse?: TDryRunAppFileResponse;
        service?: string;
        instance?: string;
        setName?: string;
      } = {}) =>
        http.post(
          withFileSet(apps.fileDryRun.mockedUrl, service, instance, setName),
          () => HttpResponse.json(mockedResponse),
        ),
    },
  },
  fileLink: {
    mockedUrl: '/api/v1/apps/{service}/{instance}/files/{set_name}/link',
    post: {
      success: ({
        mockedResponse = {
          ...DEFAULT_WRITE_RESULT,
          link: {
            name: '000_parse.vrl',
            artifact: 'syslog-parse',
            version: 3,
            digest: 'sha256:abc',
            tag: 'stable',
          },
        },
        service = 'service',
        instance = 'instance',
        setName = 'set_name',
      }: {
        mockedResponse?: TLinkAppFileResponse;
        service?: string;
        instance?: string;
        setName?: string;
      } = {}) =>
        http.post(
          withFileSet(apps.fileLink.mockedUrl, service, instance, setName),
          () => HttpResponse.json(mockedResponse),
        ),
    },
  },
  fileLinks: {
    mockedUrl: '/api/v1/apps/{service}/{instance}/files/{set_name}/links',
    get: {
      success: ({
        mockedResponse = [
          {
            name: '000_parse.vrl',
            artifact: 'syslog-parse',
            version: 3,
            digest: 'sha256:abc',
            tag: 'stable',
            resolved_digest: 'sha256:abc',
            available_version: 3,
            missing: false,
            drift: false,
            outdated: false,
          },
        ],
        service = 'service',
        instance = 'instance',
        setName = 'set_name',
      }: {
        mockedResponse?: TAppFileLinksResponse;
        service?: string;
        instance?: string;
        setName?: string;
      } = {}) =>
        http.get(
          withFileSet(apps.fileLinks.mockedUrl, service, instance, setName),
          () => HttpResponse.json(mockedResponse),
        ),
    },
  },
  fileRelink: {
    mockedUrl: '/api/v1/apps/{service}/{instance}/files/{set_name}/relink',
    post: {
      success: ({
        mockedResponse = { ...DEFAULT_WRITE_RESULT, relinked: [] },
        service = 'service',
        instance = 'instance',
        setName = 'set_name',
      }: {
        mockedResponse?: TRelinkAppFilesResponse;
        service?: string;
        instance?: string;
        setName?: string;
      } = {}) =>
        http.post(
          withFileSet(apps.fileRelink.mockedUrl, service, instance, setName),
          () => HttpResponse.json(mockedResponse),
        ),
    },
  },
};
