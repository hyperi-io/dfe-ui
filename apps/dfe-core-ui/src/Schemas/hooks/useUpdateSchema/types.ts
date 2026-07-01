import { components } from '@repo/dfe-engine-types';

export type MetaSchemaUpdateRequestBody =
  components['schemas']['MetaSchemaUpdateRequest'];

export interface MetaSchemaUpdateParameters {
  schema_path: string;
  version?: string | null;
}

export type MetaSchemaUpdateResponse =
  components['schemas']['MetaSchemaVersionWriteResponse'];
