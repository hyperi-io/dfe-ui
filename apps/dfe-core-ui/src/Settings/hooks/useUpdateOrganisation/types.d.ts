import { components } from '@repo/dfe-engine-types';

export type OrganisationUpdateRequestBody =
  components['schemas']['UpdateOrgRequest'] & {
    org_name: string;
  };
export type OrganisationUpdateResponse = components['schemas']['OrgResponse'];
