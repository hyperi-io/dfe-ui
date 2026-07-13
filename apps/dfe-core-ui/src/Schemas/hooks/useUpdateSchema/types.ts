import {
  DfeClientOperationFor,
  DfeClientRequestBody,
  DfeClientSuccessResponseBody,
} from '@/core/config/api/client.types';
import { updateSchemaPath } from './api';

export type TMetaSchemaUpdateRequestBody = DfeClientRequestBody<
  DfeClientOperationFor<typeof updateSchemaPath, 'patch'>
>;

export type TMetaSchemaUpdateResponse = DfeClientSuccessResponseBody<
  DfeClientOperationFor<typeof updateSchemaPath, 'patch'>
>;

export interface MetaSchemaUpdateParameters {
  schema_path: string;
  version?: string | null;
}
