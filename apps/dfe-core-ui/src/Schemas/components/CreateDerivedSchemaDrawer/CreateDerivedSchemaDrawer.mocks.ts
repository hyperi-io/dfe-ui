import { API_CONFIG_MOCKS } from '@/core/config/api/endpoints/generator';
import { TAuthMeResponse } from '@/core/hooks/useAuthMe/types';
import { TSchemaListResponse } from '@/core/hooks/useFetchInfiniteFilteredSchemas/types';
import {
  BASE_COLUMNS_RESPONSE,
  BASE_SCHEMA_PATH,
  BASE_SCHEMA_VERSION,
} from '@/Schemas/components/DerivedSchemaFieldPicker/DerivedSchemaFieldPicker.mocks';
import { TCreateDerivedSchemaRequest } from '@/Schemas/hooks/useCreateDerivedSchema/types';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

export { BASE_SCHEMA_PATH, BASE_SCHEMA_VERSION };

export const DERIVED_SCHEMA_NAME = 'auth';
export const DERIVED_SCHEMA_PATH = `derived/${DERIVED_SCHEMA_NAME}`;

const ADMIN_MOCKED_RESPONSE: TAuthMeResponse = {
  org_id: 'org',
  user_id: 'user',
  roles: ['role'],
  permissions: ['*'],
  groups: ['group'],
};

const SCHEMA_LIST_RESPONSE: TSchemaListResponse = {
  items: [
    {
      name: BASE_SCHEMA_PATH,
      current: BASE_SCHEMA_VERSION,
      versions: [BASE_SCHEMA_VERSION],
      updated_at: '',
      column_count: 4,
      resource_type: 'custom',
    },
  ],
  total: 1,
  page: 1,
  per_page: 10,
  total_pages: 1,
  next_page: null,
  prev_page: null,
  objects: { items: [], children: {} },
};

/** The body the drawer sends, so a test can assert the contract rather than the click. */
export const capturedRequests: TCreateDerivedSchemaRequest[] = [];

export const resetCapturedRequests = () => {
  capturedRequests.length = 0;
};

export const server = setupServer(
  API_CONFIG_MOCKS.auth.me.get.success({
    mockedResponse: ADMIN_MOCKED_RESPONSE,
  }),
  API_CONFIG_MOCKS.schemas.default.get.success({
    mockedResponse: SCHEMA_LIST_RESPONSE,
  }),
  API_CONFIG_MOCKS.schemas.schemaDetail.get.success({
    mockedResponse: BASE_COLUMNS_RESPONSE,
    schema_path: BASE_SCHEMA_PATH,
  }),
  http.post(
    `/api/v1/schemas/definitions/${DERIVED_SCHEMA_PATH}`,
    async ({ request }) => {
      const body = (await request.json()) as TCreateDerivedSchemaRequest;
      capturedRequests.push(body);
      return HttpResponse.json({
        path: body.path,
        current: body.current,
        base: body.base,
        base_version: body.base_version,
        versions: body.versions,
      });
    },
  ),
);
