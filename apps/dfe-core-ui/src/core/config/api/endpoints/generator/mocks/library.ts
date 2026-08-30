import { TCreateLibraryArtifactResponse } from '@/Library/hooks/useCreateLibraryArtifact/types';
import { TDeleteLibraryArtifactResponse } from '@/Library/hooks/useDeleteLibraryArtifact/types';
import { TDeleteLibraryTagResponse } from '@/Library/hooks/useDeleteLibraryTag/types';
import { TLibraryArtifactDetail } from '@/Library/hooks/useFetchLibraryArtifactDetail/types';
import { TLibraryArtifactsResponse } from '@/core/hooks/library/useFetchLibraryArtifacts/types';
import { TLibraryKindsResponse } from '@/Library/hooks/useFetchLibraryKinds/types';
import { TLibraryUsageResponse } from '@/Library/hooks/useFetchLibraryUsage/types';
import { TLibraryVersionDetail } from '@/Library/hooks/useFetchLibraryVersionDetail/types';
import { TLibraryVersionsResponse } from '@/Library/hooks/useFetchLibraryVersions/types';
import { TPatchLibraryArtifactResponse } from '@/Library/hooks/usePatchLibraryArtifact/types';
import { TPublishLibraryVersionResponse } from '@/Library/hooks/usePublishLibraryVersion/types';
import { TRollbackLibraryArtifactResponse } from '@/Library/hooks/useRollbackLibraryArtifact/types';
import { TSetLibraryArtifactStateResponse } from '@/Library/hooks/useSetLibraryArtifactState/types';
import { TSetLibraryTagResponse } from '@/Library/hooks/useSetLibraryTag/types';
import { http, HttpResponse } from 'msw';
import {
  DEFAULT_VALIDATION_ERROR,
  TValidationError,
} from './endpoints.generator.mocks.types';

const DEFAULT_ARTIFACT: TLibraryArtifactDetail = {
  name: 'syslog-parse',
  kind: 'vrl',
  state: 'enabled',
  group: 'network',
  description: 'Parses syslog into the common header',
  labels: { team: 'platform' },
  current: 3,
  versions: [1, 2, 3],
  tags: { stable: 2 },
  digest: 'sha256:abc',
};

const DEFAULT_WRITE_RESULT = {
  changed: true,
  commit_sha: 'abc1234',
  auto_merged: true,
  review_required: false,
  pr_url: null,
  version: 4,
  validation: null,
};

export const library = {
  default: {
    mockedUrl: '/api/v1/library',
    get: {
      success: ({
        mockedResponse = [DEFAULT_ARTIFACT],
      }: { mockedResponse?: TLibraryArtifactsResponse } = {}) =>
        http.get(library.default.mockedUrl, () =>
          HttpResponse.json(mockedResponse),
        ),
      error: ({
        mockedResponse = DEFAULT_VALIDATION_ERROR,
        status = 500,
      }: { mockedResponse?: TValidationError; status?: number } = {}) =>
        http.get(library.default.mockedUrl, () =>
          HttpResponse.json(mockedResponse, { status }),
        ),
    },
    post: {
      success: ({
        mockedResponse = DEFAULT_WRITE_RESULT,
      }: { mockedResponse?: TCreateLibraryArtifactResponse } = {}) =>
        http.post(library.default.mockedUrl, () =>
          HttpResponse.json(mockedResponse),
        ),
      error: ({
        mockedResponse = DEFAULT_VALIDATION_ERROR,
        status = 409,
      }: { mockedResponse?: TValidationError; status?: number } = {}) =>
        http.post(library.default.mockedUrl, () =>
          HttpResponse.json(mockedResponse, { status }),
        ),
    },
  },
  kinds: {
    mockedUrl: '/api/v1/library/kinds',
    get: {
      success: ({
        mockedResponse = [
          {
            name: 'vrl',
            language: 'vrl',
            suffixes: ['.vrl'],
            encoding: 'text',
          },
        ],
      }: { mockedResponse?: TLibraryKindsResponse } = {}) =>
        http.get(library.kinds.mockedUrl, () =>
          HttpResponse.json(mockedResponse),
        ),
    },
  },
  artifact: {
    mockedUrl: '/api/v1/library/{artifact}',
    get: {
      success: ({
        mockedResponse = DEFAULT_ARTIFACT,
        artifact = 'artifact',
      }: {
        mockedResponse?: TLibraryArtifactDetail;
        artifact?: string;
      } = {}) =>
        http.get(
          library.artifact.mockedUrl.replace('{artifact}', artifact),
          () => HttpResponse.json(mockedResponse),
        ),
    },
    patch: {
      success: ({
        mockedResponse = DEFAULT_WRITE_RESULT,
        artifact = 'artifact',
      }: {
        mockedResponse?: TPatchLibraryArtifactResponse;
        artifact?: string;
      } = {}) =>
        http.patch(
          library.artifact.mockedUrl.replace('{artifact}', artifact),
          () => HttpResponse.json(mockedResponse),
        ),
    },
    delete: {
      success: ({
        mockedResponse = DEFAULT_WRITE_RESULT,
        artifact = 'artifact',
      }: {
        mockedResponse?: TDeleteLibraryArtifactResponse;
        artifact?: string;
      } = {}) =>
        http.delete(
          library.artifact.mockedUrl.replace('{artifact}', artifact),
          () => HttpResponse.json(mockedResponse),
        ),
      error: ({
        mockedResponse = DEFAULT_VALIDATION_ERROR,
        status = 409,
        artifact = 'artifact',
      }: {
        mockedResponse?: TValidationError;
        status?: number;
        artifact?: string;
      } = {}) =>
        http.delete(
          library.artifact.mockedUrl.replace('{artifact}', artifact),
          () => HttpResponse.json(mockedResponse, { status }),
        ),
    },
  },
  rollback: {
    mockedUrl: '/api/v1/library/{artifact}/rollback',
    post: {
      success: ({
        mockedResponse = DEFAULT_WRITE_RESULT,
        artifact = 'artifact',
      }: {
        mockedResponse?: TRollbackLibraryArtifactResponse;
        artifact?: string;
      } = {}) =>
        http.post(
          library.rollback.mockedUrl.replace('{artifact}', artifact),
          () => HttpResponse.json(mockedResponse),
        ),
    },
  },
  state: {
    mockedUrl: '/api/v1/library/{artifact}/state',
    put: {
      success: ({
        mockedResponse = DEFAULT_WRITE_RESULT,
        artifact = 'artifact',
      }: {
        mockedResponse?: TSetLibraryArtifactStateResponse;
        artifact?: string;
      } = {}) =>
        http.put(library.state.mockedUrl.replace('{artifact}', artifact), () =>
          HttpResponse.json(mockedResponse),
        ),
    },
  },
  tag: {
    mockedUrl: '/api/v1/library/{artifact}/tags/{tag}',
    put: {
      success: ({
        mockedResponse = DEFAULT_WRITE_RESULT,
        artifact = 'artifact',
        tag = 'tag',
      }: {
        mockedResponse?: TSetLibraryTagResponse;
        artifact?: string;
        tag?: string;
      } = {}) =>
        http.put(
          library.tag.mockedUrl
            .replace('{artifact}', artifact)
            .replace('{tag}', tag),
          () => HttpResponse.json(mockedResponse),
        ),
    },
    delete: {
      success: ({
        mockedResponse = DEFAULT_WRITE_RESULT,
        artifact = 'artifact',
        tag = 'tag',
      }: {
        mockedResponse?: TDeleteLibraryTagResponse;
        artifact?: string;
        tag?: string;
      } = {}) =>
        http.delete(
          library.tag.mockedUrl
            .replace('{artifact}', artifact)
            .replace('{tag}', tag),
          () => HttpResponse.json(mockedResponse),
        ),
    },
  },
  usage: {
    mockedUrl: '/api/v1/library/{artifact}/usage',
    get: {
      success: ({
        mockedResponse = [
          {
            service: 'dfe-transform-vrl',
            instance: 'syslog',
            file_set: 'transforms',
            name: '000_parse.vrl',
            version: 3,
            tag: 'stable',
          },
        ],
        artifact = 'artifact',
      }: {
        mockedResponse?: TLibraryUsageResponse;
        artifact?: string;
      } = {}) =>
        http.get(library.usage.mockedUrl.replace('{artifact}', artifact), () =>
          HttpResponse.json(mockedResponse),
        ),
    },
  },
  versions: {
    mockedUrl: '/api/v1/library/{artifact}/versions',
    get: {
      success: ({
        mockedResponse = [
          {
            version: 3,
            digest: 'sha256:abc',
            size_bytes: 42,
            description: 'add hostname',
            published_by: 'derek',
            published_at: 1756500000,
            message: '',
          },
        ],
        artifact = 'artifact',
      }: {
        mockedResponse?: TLibraryVersionsResponse;
        artifact?: string;
      } = {}) =>
        http.get(
          library.versions.mockedUrl.replace('{artifact}', artifact),
          () => HttpResponse.json(mockedResponse),
        ),
    },
    post: {
      success: ({
        mockedResponse = DEFAULT_WRITE_RESULT,
        artifact = 'artifact',
      }: {
        mockedResponse?: TPublishLibraryVersionResponse;
        artifact?: string;
      } = {}) =>
        http.post(
          library.versions.mockedUrl.replace('{artifact}', artifact),
          () => HttpResponse.json(mockedResponse),
        ),
      error: ({
        mockedResponse = DEFAULT_VALIDATION_ERROR,
        status = 409,
        artifact = 'artifact',
      }: {
        mockedResponse?: TValidationError;
        status?: number;
        artifact?: string;
      } = {}) =>
        http.post(
          library.versions.mockedUrl.replace('{artifact}', artifact),
          () => HttpResponse.json(mockedResponse, { status }),
        ),
    },
  },
  version: {
    mockedUrl: '/api/v1/library/{artifact}/versions/{version}',
    get: {
      success: ({
        mockedResponse = {
          version: 3,
          digest: 'sha256:abc',
          size_bytes: 42,
          description: 'add hostname',
          published_by: 'derek',
          published_at: 1756500000,
          message: '',
          kind: 'vrl',
          encoding: 'text',
          content: '. = parse_json!(.message)',
        },
        artifact = 'artifact',
        version = 'version',
      }: {
        mockedResponse?: TLibraryVersionDetail;
        artifact?: string;
        version?: string;
      } = {}) =>
        http.get(
          library.version.mockedUrl
            .replace('{artifact}', artifact)
            .replace('{version}', version),
          () => HttpResponse.json(mockedResponse),
        ),
    },
  },
};
