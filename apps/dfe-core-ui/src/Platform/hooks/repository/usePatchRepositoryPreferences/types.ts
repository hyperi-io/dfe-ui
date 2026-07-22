import {
  DfeClientOperationFor,
  DfeClientRequestBody,
  DfeClientSuccessResponseBody,
} from '@/core/config/api/client.types';
import { repositoryPreferencesPath } from './api';

export type TRepositoryPreferencesRequest = DfeClientRequestBody<
  DfeClientOperationFor<typeof repositoryPreferencesPath, 'patch'>
>;

export type TRepositoryPreferencesResponse = DfeClientSuccessResponseBody<
  DfeClientOperationFor<typeof repositoryPreferencesPath, 'patch'>
>;
