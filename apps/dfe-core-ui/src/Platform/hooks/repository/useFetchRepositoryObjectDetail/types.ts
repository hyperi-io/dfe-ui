import {
  DfeClientOperationFor,
  DfeClientSuccessResponseBody,
} from '@/core/config/api/client.types';
import { repositoryObjectDetailPath } from './api';

export type TRepositoryObjectDetailResponse = DfeClientSuccessResponseBody<
  DfeClientOperationFor<typeof repositoryObjectDetailPath, 'get'>
>;
