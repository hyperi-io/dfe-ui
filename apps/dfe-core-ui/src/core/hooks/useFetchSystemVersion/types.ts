import {
  DfeClientOperationFor,
  DfeClientSuccessResponseBody,
} from '@/core/config/api/client.types';
import { systemVersionPath } from './api';

// Derived straight from the path constant: importing it back from api.ts would cycle.
// `apps` is not yet in the vendored openapi spec; the deployed API already
// returns it, so it is added by hand until codegen catches up.
export type TSystemVersionResponse = DfeClientSuccessResponseBody<
  DfeClientOperationFor<typeof systemVersionPath, 'get'>
> & {
  apps?: Record<string, string>;
};
