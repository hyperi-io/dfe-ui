import {
  DfeClientOperationFor,
  DfeClientSuccessResponseBody,
} from '@/core/config/api/client.types';
import { systemVersionPath } from './api';

// Derived straight from the path constant: importing it back from api.ts would cycle.
export type TSystemVersionResponse = DfeClientSuccessResponseBody<
  DfeClientOperationFor<typeof systemVersionPath, 'get'>
>;
