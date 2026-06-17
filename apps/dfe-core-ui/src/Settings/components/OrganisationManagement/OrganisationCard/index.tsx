import { DeleteOrganisationModal } from '@/Settings/components/OrganisationManagement/DeleteOrganisationModal';
import { EditOrganisationDrawer } from '@/Settings/components/OrganisationManagement/EditOrganisationDrawer';
import { ViewOrganisationDrawer } from '@/Settings/components/OrganisationManagement/ViewOrganisationDrawer';
import { PopoverMenu } from '@/Settings/components/PopoverMenu';
import { Organisation } from '@/Settings/hooks/useFetchOrganisations/types';
import { IconLockFilled } from '@repo/dfe-icons';

export const OrganisationCard = ({
  organisation,
  refetch,
}: {
  organisation: Organisation;
  refetch: () => void;
}) => {
  const isParentOrganisation = (organisation.org_ids?.length ?? 0) > 0;
  return (
    <div className="rounded-md p-4 border border-foreground/10 dark:border-dark-foreground/10 relative">
      <PopoverMenu
        className="absolute top-1 right-1"
        ariaLabel="Organisation actions"
        options={[
          <ViewOrganisationDrawer
            key="view-organisation"
            org_name={organisation.name}
            display_name={organisation.display_name}
          />,
          <EditOrganisationDrawer
            key="edit-organisation"
            organisation={organisation}
            refetch={refetch}
          />,
          <DeleteOrganisationModal
            key="delete-organisation"
            disabled={isParentOrganisation}
            org_name={organisation.name}
            display_name={organisation.display_name}
            refetch={refetch}
          />,
        ]}
      />

      <div className="flex flex-col items-center gap-2">
        <span className="w-12 h-12 rounded-full overflow-hidden flex items-center justify-center bg-brand-primary dark:bg-secondary">
          <p className="text-white text-sm">
            {organisation.name.charAt(0).toUpperCase()}
          </p>
        </span>
        <h3 className="font-medium">{organisation.display_name}</h3>
      </div>
      {isParentOrganisation && (
        <span className="absolute bottom-1 right-1 bg-brand-primary dark:bg-secondary rounded-full p-1 text-white text-xs">
          <IconLockFilled />
        </span>
      )}
    </div>
  );
};
