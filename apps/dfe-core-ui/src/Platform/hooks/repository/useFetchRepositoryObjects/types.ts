import {
  DfeClientOperationFor,
  DfeClientSuccessResponseBody,
} from '@/core/config/api/client.types';
import { repositoryObjectsPath } from './api';

export type TRepositoryObjectsResponse = DfeClientSuccessResponseBody<
  DfeClientOperationFor<typeof repositoryObjectsPath, 'get'>
>;
