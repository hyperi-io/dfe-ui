import {
  DfeClientOperationFor,
  DfeClientRequestBody,
  DfeClientSuccessResponseBody,
} from '@/core/config/api/client.types';
import { createSchemaPath } from './api';

export type TCreateSchemaRequest = DfeClientRequestBody<
  DfeClientOperationFor<typeof createSchemaPath, 'post'>
> & {
  schema_type?: 'meta' | 'common_header' | 'hunts';
};
export type TCreateSchemaRequestColumn =
  TCreateSchemaRequest['versions'][number]['columns'][number];

export type TCreateSchemaResponse = DfeClientSuccessResponseBody<
  DfeClientOperationFor<typeof createSchemaPath, 'post'>
>;

// TODO: API response type is not aligned, fix this
export interface SchemaCreateValidationErrorResponse {
  message: string;
  errors: { message: string }[];
}
