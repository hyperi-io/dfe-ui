import {
  DfeClientOperationFor,
  DfeClientSuccessResponseBody,
} from '@/core/config/api/client.types';

import { backingServicesPath } from './api';

export type TBackingServicesResponse = DfeClientSuccessResponseBody<
  DfeClientOperationFor<typeof backingServicesPath, 'get'>
>;

/** One backing service's deploy configuration as the deploy repo declares it. */
export type TBackingService = TBackingServicesResponse[number];

/**
 * One declared value. A null `source` means nothing declared it, so the chart
 * or profile tier default applies - a value the engine cannot see and the UI
 * must not invent.
 */
export type TDeclaredValue = TBackingService['replicas'];
