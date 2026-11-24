import {
  DfeClientOperationFor,
  DfeClientSuccessResponseBody,
} from '@/core/config/api/client.types';
import { featureFlagsPath } from './api';

export type TFeatureFlagsResponse = DfeClientSuccessResponseBody<
  DfeClientOperationFor<typeof featureFlagsPath, 'get'>
>;
