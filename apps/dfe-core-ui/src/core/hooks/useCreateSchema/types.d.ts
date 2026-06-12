import { components } from '@repo/dfe-engine-types';

export type SchemaCreateRequest = components['schemas']['MetaSchema-Input'];
export type SchemaCreateRequestColumn =
  components['schemas']['SchemaColumn-Input'];

export type SchemaCreateResponse = components['schemas']['MetaSchema-Output'];

// TODO: API response type is not aligned, fix this
export interface SchemaCreateValidationErrorResponse {
  message: string;
  errors: { message: string }[];
}
