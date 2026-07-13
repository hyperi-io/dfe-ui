import {
  DfeClientOperationFor,
  DfeClientSuccessResponseBody,
} from '@/core/config/api/client.types';
import { refreshTokenPath } from './api';

export type TRefreshTokenResponse = DfeClientSuccessResponseBody<
  DfeClientOperationFor<typeof refreshTokenPath, 'post'>
>;
