import { problem } from '@/core/utils/test-utils/problem';
import { API_CONFIG_MOCKS } from '@/core/config/api/endpoints/generator';
import { TAuthMeResponse } from '@/core/hooks/useAuthMe/types';
import { TSchemaListResponse } from '@/core/hooks/useFetchInfiniteFilteredSchemas/types';
import {
  BASE_COLUMNS_RESPONSE,
  BASE_SCHEMA_PATH,
  BASE_SCHEMA_VERSION,
} from '@/Schemas/components/DerivedSchemaFieldPicker/DerivedSchemaFieldPicker.mocks';
import { TMetaSchemaDetailResponse } from '@/Schemas/hooks/useFetchInfiniteSchemaDetailColumns/types';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

export { BASE_SCHEMA_PATH, BASE_SCHEMA_VERSION };

const ADMIN: TAuthMeResponse = {
  org_id: 'org',
  user_id: 'user',
  roles: ['role'],
  permissions: ['*'],
  groups: ['group'],
  external: false,
  blocked: false,
  disabled_at: '',
  blocked_at: '',
  password_change_required: false,
  hyperdx_role: 'string',
  hyperdx_identity: 'string',
};

const SCHEMA_LIST: TSchemaListResponse = {
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
  total_size: 1,
  next_page_token: null,
  objects: { items: [], children: {} },
};

/** What the schema page holds: one filtered page of the four columns. */
export const FILTERED_PAGE: TMetaSchemaDetailResponse = {
  ...BASE_COLUMNS_RESPONSE,
  items: BASE_COLUMNS_RESPONSE.items.slice(0, 1),
  total_size: 1,
};

/** Whether the full-schema read, which pages at the largest size, answers 500. */
export const fullRead = { fails: true };

export const server = setupServer(
  API_CONFIG_MOCKS.auth.me.get.success({ mockedResponse: ADMIN }),
  API_CONFIG_MOCKS.schemas.default.get.success({ mockedResponse: SCHEMA_LIST }),
  http.get(
    API_CONFIG_MOCKS.schemas.schemaDetail.mockedUrl.replace(
      '{schema_path}',
      BASE_SCHEMA_PATH,
    ),
    () =>
      fullRead.fails
        ? HttpResponse.json(problem(500, 'internal_error', 'engine down'), {
            status: 500,
          })
        : HttpResponse.json(BASE_COLUMNS_RESPONSE),
  ),
);
