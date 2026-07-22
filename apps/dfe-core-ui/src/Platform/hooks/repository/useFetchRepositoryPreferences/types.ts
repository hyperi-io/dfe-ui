import {
  DfeClientOperationFor,
  DfeClientSuccessResponseBody,
} from '@/core/config/api/client.types';
import { repositoryPreferencesPath } from './api';

export type TRepositoryPreferencesResponse = DfeClientSuccessResponseBody<
  DfeClientOperationFor<typeof repositoryPreferencesPath, 'get'>
>;
