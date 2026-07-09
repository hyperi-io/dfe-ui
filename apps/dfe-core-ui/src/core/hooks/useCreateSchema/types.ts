import { components } from '@repo/dfe-engine-types';

export type SchemaCreateRequest =
  components['schemas']['MetaSchemaCreateRequest'] & {
    schema_type?: 'meta' | 'common_header' | 'additional' | 'hunts';
  };
export type SchemaCreateRequestColumn =
  components['schemas']['SchemaColumnWrite'];

export type SchemaCreateResponse = components['schemas']['MetaSchema'];

// TODO: API response type is not aligned, fix this
export interface SchemaCreateValidationErrorResponse {
  message: string;
  errors: { message: string }[];
}
