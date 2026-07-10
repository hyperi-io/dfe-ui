import {
  DfeClientOperationFor,
  DfeClientRequestBody,
  DfeClientSuccessResponseBody,
} from '@/core/config/api/client.types';
import { createSchemaVersionPath } from './api';

export type TSchemaCreateVersionRequest = DfeClientRequestBody<
  DfeClientOperationFor<typeof createSchemaVersionPath, 'post'>
>;
export type TSchemaCreateVersionResponse = DfeClientSuccessResponseBody<
  DfeClientOperationFor<typeof createSchemaVersionPath, 'post'>
>;

// TODO: API response type is not aligned, fix this
export interface SchemaCreateVersionValidationErrorResponse {
  message: string;
  errors: { message: string }[];
}
