import {
  DfeClientOperationFor,
  DfeClientRequestBody,
  DfeClientSuccessResponseBody,
} from '@/core/config/api/client.types';
import { elasticConvertPath } from './api';

export type ElasticConverterFormData = {
  file: File | Blob;
};

export type TElasticConvertRequest = DfeClientRequestBody<
  DfeClientOperationFor<typeof elasticConvertPath, 'post'>
>;
export type TElasticConvertResponse = DfeClientSuccessResponseBody<
  DfeClientOperationFor<typeof elasticConvertPath, 'post'>
>;
