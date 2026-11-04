import {
  DfeClientOperationFor,
  DfeClientPageItem,
  DfeClientSuccessResponseBody,
} from '@/core/config/api/client.types';

import { adminLinksPath } from './api';

export type TAdminLinksResponse = DfeClientSuccessResponseBody<
  DfeClientOperationFor<typeof adminLinksPath, 'get'>
>;

/** One admin UI the deployment runs, as its deployer listed it. */
export type TAdminLink = DfeClientPageItem<TAdminLinksResponse>;

/** `unknown` means the deployer gave the engine no address to probe. */
export type TAdminLinkStatus = TAdminLink['status'];
