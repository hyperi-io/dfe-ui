import {
  DfeClientOperationFor,
  DfeClientSuccessResponseBody,
} from '@/core/config/api/client.types';

import { appsPath } from './api';

export type TAppsResponse = DfeClientSuccessResponseBody<
  DfeClientOperationFor<typeof appsPath, 'get'>
>;

/** One app in the catalogue, with the instances currently deployed. */
export type TAppCatalogueEntry = TAppsResponse[number];

/** A family of files an app reads off disk. Empty for an app that reads none. */
export type TAppFileSet = TAppCatalogueEntry['file_sets'][number];
