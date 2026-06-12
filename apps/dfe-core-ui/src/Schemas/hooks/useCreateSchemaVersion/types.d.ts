import { components } from '@repo/dfe-engine-types';

export type SchemaCreateVersionRequest =
  components['schemas']['MetaSchemaAddVersionRequest'];
export type SchemaCreateVersionResponse =
  components['schemas']['MetaSchema-Output'];

// TODO: API response type is not aligned, fix this
export interface SchemaCreateVersionValidationErrorResponse {
  message: string;
  errors: { message: string }[];
}
