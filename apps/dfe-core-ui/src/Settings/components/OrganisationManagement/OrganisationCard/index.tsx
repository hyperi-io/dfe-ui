import { DeleteOrganisationModal } from '@/Settings/components/OrganisationManagement/DeleteOrganisationModal';
import { EditOrganisationDrawer } from '@/Settings/components/OrganisationManagement/EditOrganisationDrawer';
import { ViewOrganisationDrawer } from '@/Settings/components/OrganisationManagement/ViewOrganisationDrawer';
import { PopoverMenu } from '@/core/components/PopoverMenu';
import { TOrganisationListSummary } from '@/core/hooks/useFetchInfiniteFilteredOrganisations/types';

const DEFAULT_ORGANISATION_NAME = 'default';
const DEFAULT_ORGANISATION_DELETE_REASON =
  'This organisation is reserved: every record that names no organisation lands in it.';

export const OrganisationCard = ({
  organisation,
}: {
  organisation: TOrganisationListSummary;
}) => {
  const orgIcon =
    organisation.display_name?.charAt(0).toUpperCase() ??
    organisation.name.charAt(0).toUpperCase();
  return (
    <div className="rounded-md p-4 border border-foreground/10 dark:border-dark-foreground/10 relative">
      <PopoverMenu
        className="absolute top-1 right-1"
        ariaLabel={`${organisation.display_name} actions`}
        options={[
          <ViewOrganisationDrawer
            key="view-organisation"
            org_name={organisation.name}
            display_name={organisation.display_name}
          />,
          <EditOrganisationDrawer
            key="edit-organisation"
            organisation={organisation}
          />,
          <DeleteOrganisationModal
            key="delete-organisation"
            org_name={organisation.name}
            display_name={organisation.display_name}
            disabledReason={
              organisation.name === DEFAULT_ORGANISATION_NAME
                ? DEFAULT_ORGANISATION_DELETE_REASON
                : undefined
            }
          />,
        ]}
      />

      <div className="flex flex-col items-center gap-2">
        <span className="w-12 h-12 rounded-full overflow-hidden flex items-center justify-center bg-brand-primary dark:bg-secondary">
          <p className="text-white text-sm">{orgIcon}</p>
        </span>
        <h3 className="font-medium">{organisation.display_name}</h3>
      </div>
    </div>
  );
};
