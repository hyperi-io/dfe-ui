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
  total: 1,
  page: 1,
  per_page: 10,
  total_pages: 1,
  next_page: null,
  prev_page: null,
  objects: { items: [], children: {} },
};

/** What the schema page holds: one filtered page of the four columns. */
export const FILTERED_PAGE: TMetaSchemaDetailResponse = {
  ...BASE_COLUMNS_RESPONSE,
  version: {
    ...BASE_COLUMNS_RESPONSE.version,
    columns: {
      ...BASE_COLUMNS_RESPONSE.version.columns,
      items: BASE_COLUMNS_RESPONSE.version.columns.items.slice(0, 1),
      total: 1,
    },
  },
};

/** Whether the full-schema read (`per_page=-1`) answers 500. */
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
        ? HttpResponse.json({ message: 'engine down' }, { status: 500 })
        : HttpResponse.json(BASE_COLUMNS_RESPONSE),
  ),
);
