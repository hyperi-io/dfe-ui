import {
  DfeClientOperationFor,
  DfeClientSuccessResponseBody,
} from '@/core/config/api/client.types';
import { elasticConvertPath } from './api';

export type ElasticConverterFormData = {
  file: File | Blob;
};

export type TElasticConvertResponse = DfeClientSuccessResponseBody<
  DfeClientOperationFor<typeof elasticConvertPath, 'post'>
>;
