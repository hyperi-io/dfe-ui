import {
  DfeClientOperationFor,
  DfeClientRequestBody,
  DfeClientSuccessResponseBody,
} from '@/core/config/api/client.types';
import { repositoryObjectPath } from './api';

export type TUpdateRepositoryObjectRequest = DfeClientRequestBody<
  DfeClientOperationFor<typeof repositoryObjectPath, 'put'>
>;

export type TUpdateRepositoryObjectResponse = DfeClientSuccessResponseBody<
  DfeClientOperationFor<typeof repositoryObjectPath, 'put'>
>;
