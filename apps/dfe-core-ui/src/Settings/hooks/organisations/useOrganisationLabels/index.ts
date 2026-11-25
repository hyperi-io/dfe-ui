import { useAdministeredOrg } from '@/core/hooks/useAdministeredOrg';
import { useFetchInfiniteFilteredOrganisations } from '@/core/hooks/useFetchInfiniteFilteredOrganisations';
import { useFetchYourOrganisation } from '@/core/hooks/useFetchYourOrganisation';
import { SHOW_ALL_PAGE_SIZE } from '@/Settings/hooks/useShowMore';

/** Whether an organisation is yours, without reading the organisation list. */
export const useIsYourOrg = () => {
  const administeredOrg = useAdministeredOrg();
  const { data: yours } = useFetchYourOrganisation();
  // An org admin's organisation is the one it administers. Otherwise it is the deployment's, which a platform provider signs people into by naming none.
  return (org: string) =>
    administeredOrg ? org === administeredOrg : !org || org === yours?.name;
};

/** Organisations as people read them: by display name, yours told apart. An org admin may not read the org list, so an organisation it lacks shows by its name. */
export const useOrganisationLabels = () => {
  const administeredOrg = useAdministeredOrg();
  const isYours = useIsYourOrg();
  const {
    data: { items: organisations = [] },
  } = useFetchInfiniteFilteredOrganisations({ page_size: SHOW_ALL_PAGE_SIZE });
  const { data: yours } = useFetchYourOrganisation();
  const displayNames = new Map(
    organisations.map((org) => [org.name, org.display_name || org.name]),
  );
  const orgLabel = (org: string) => displayNames.get(org) ?? org;
  return {
    isYours,
    orgLabel,
    yourLabel: administeredOrg
      ? orgLabel(administeredOrg)
      : yours?.display_name || yours?.name || 'Your organisation',
  };
};
