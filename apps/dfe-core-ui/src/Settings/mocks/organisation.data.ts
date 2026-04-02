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
];

export const ORGANISATION_DETAILS_RESPONSE = createOrganisation({
  name: 'HyperI',
});
