import type {
  DfeClientOperationFor,
  DfeClientSuccessResponseBody,
} from '@/core/config/api/client.types';

export type TSourceVersionDetail = DfeClientSuccessResponseBody<
  DfeClientOperationFor<'/api/v1/sources/{name}/versions/{version}', 'get'>
>;

export type TSourceColumnsResponse = DfeClientSuccessResponseBody<
  DfeClientOperationFor<'/api/v1/sources/{name}/columns', 'get'>
>;
