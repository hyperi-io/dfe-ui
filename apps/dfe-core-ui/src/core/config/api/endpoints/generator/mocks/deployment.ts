import { TAdminLinksResponse } from '@/AdminTools/hooks/useFetchAdminLinks/types';
import { ApiErrorResponseBody } from '@/core/config/api/client';
import { http, HttpResponse } from 'msw';

/** Every status the engine reports, so one render shows each marker. */
const DEFAULT_ADMIN_LINKS: TAdminLinksResponse = [
  {
    name: 'Argo CD',
    purpose: 'Sync, diff and roll back the deployed apps',
    url: 'https://argocd.example.com',
    status: 'up',
  },
  {
    name: 'Redpanda Console',
    purpose: 'Browse topics, consumer groups and lag',
    url: 'https://kafka-console.example.com',
    status: 'down',
  },
  {
    name: 'MinIO Console',
    purpose: 'Manage the archive buckets',
    url: 'https://minio.example.com',
    status: 'up',
  },
  {
    name: 'OpenBao',
    purpose: 'Read and rotate the deployment secrets',
    url: 'https://bao.example.com',
    status: 'unknown',
  },
];

const FORBIDDEN: ApiErrorResponseBody = {
  code: 'forbidden',
  message: "Action 'deployment:admin_links:read' denied",
};

export const deployment = {
  adminLinks: {
    mockedUrl: '/api/v1/deployment/admin-links',
    get: {
      success: ({
        mockedResponse = DEFAULT_ADMIN_LINKS,
      }: { mockedResponse?: TAdminLinksResponse } = {}) =>
        http.get(deployment.adminLinks.mockedUrl, () =>
          HttpResponse.json(mockedResponse),
        ),
      error: ({
        mockedResponse = FORBIDDEN,
        status = 403,
      }: { mockedResponse?: ApiErrorResponseBody; status?: number } = {}) =>
        http.get(deployment.adminLinks.mockedUrl, () =>
          HttpResponse.json(mockedResponse, { status }),
        ),
    },
  },
};
