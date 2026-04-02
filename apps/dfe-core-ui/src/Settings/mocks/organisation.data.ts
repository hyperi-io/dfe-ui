import hyperILogo from '@/core/assets/images/logo/primary-logo-mark.svg';
import type { StaticImageData } from 'next/image';
import { v4 as uuidv4 } from 'uuid';

interface OrganisationRequest {
  name: string;
  logo?: string | StaticImageData;
  brandColor?: string;
  owner?: boolean;
}

export type Organisation = OrganisationRequest & {
  id: string;
};

const createOrganisation = ({
  name,
  logo,
  brandColor,
  owner,
}: OrganisationRequest) => {
  return {
    name,
    owner,
    logo: logo ?? hyperILogo,
    brandColor: brandColor ?? '#f1f1f1',
    id: uuidv4(),
  };
};
export const ORGANISATION_LIST_RESPONSE = [
  createOrganisation({ name: 'HyperI', owner: true }),
  createOrganisation({ name: 'HyperSec' }),
  createOrganisation({ name: 'HyperSec Labs' }),
  createOrganisation({ name: 'HyperSec Infra' }),
  createOrganisation({ name: 'HyperSec Dev' }),
  createOrganisation({ name: 'HyperSec QA' }),
  createOrganisation({ name: 'HyperSec Prod' }),
  createOrganisation({ name: 'HyperSec Test' }),
  createOrganisation({ name: 'HyperI Labs' }),
  createOrganisation({ name: 'HyperI Infra' }),
  createOrganisation({ name: 'HyperI Dev' }),
  createOrganisation({ name: 'HyperI QA' }),
  createOrganisation({ name: 'HyperI Prod' }),
  createOrganisation({ name: 'HyperI Test' }),
];

export const ORGANISATION_DETAILS_RESPONSE = createOrganisation({
  name: 'HyperI',
});
