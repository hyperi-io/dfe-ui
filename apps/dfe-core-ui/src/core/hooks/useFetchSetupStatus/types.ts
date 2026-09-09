import {
  DfeClientOperationFor,
  DfeClientSuccessResponseBody,
} from '@/core/config/api/client.types';
import { fetchSetupStatusPath } from './api';

export type TFetchSetupStatusResponse = DfeClientSuccessResponseBody<
  DfeClientOperationFor<typeof fetchSetupStatusPath, 'get'>
>;

export type TOidcProvider =
  | NonNullable<TFetchSetupStatusResponse['oidc_providers']>[number]
  | null;
export type TOrganisation =
  | NonNullable<TFetchSetupStatusResponse['organisations']>[number]
  | null;
export type TSetupWizardProps = {
  oidcProvider: TOidcProvider;
  organisation: TOrganisation;
  userCreated: boolean;
};
