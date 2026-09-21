import { apiClient } from '@/core/config/api';
import { DfeClientRequestOptions } from '@/core/config/api/client.types';
import { API_CONFIG } from '@/core/config/api/endpoints';
import {
  TCreateDerivedSchemaRequest,
  TCreateDerivedSchemaResponse,
} from './types';

export const createDerivedSchemaPath = API_CONFIG.schemas.schema;

type CreateDerivedSchemaOptions = {
  pathParams: { schema_path: string };
  body: TCreateDerivedSchemaRequest;
};

/**
 * Create a derived schema on the existing schema-definition endpoint.
 *
 * The request and response are typed in ./types because the engine's OpenAPI
 * spec still describes only the column-carrying body; the cast is confined here
 * and comes out when the generated types carry `base` and `select`.
 */
export const createDerivedSchema = (options: CreateDerivedSchemaOptions) =>
  apiClient.post(
    createDerivedSchemaPath,
    options as unknown as DfeClientRequestOptions<
      typeof createDerivedSchemaPath,
      'post'
    >,
  ) as unknown as Promise<TCreateDerivedSchemaResponse>;
