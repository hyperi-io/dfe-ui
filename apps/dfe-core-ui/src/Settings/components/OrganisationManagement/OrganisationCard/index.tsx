import { ArchiveOrganisationDrawer } from '@/Settings/components/OrganisationManagement/ArchiveOrganisationDrawer';
import { EditOrganisationDrawer } from '@/Settings/components/OrganisationManagement/EditOrganisationDrawer';
import { ViewOrganisationDrawer } from '@/Settings/components/OrganisationManagement/ViewOrganisationDrawer';
import { PopoverMenu } from '@/Settings/components/PopoverMenu';
import { Organisation } from '@/Settings/mocks/organisation.data';
import { IconLockFilled } from '@repo/dfe-icons';
import Image from 'next/image';

export const OrganisationCard = ({
  organisation,
}: {
  organisation: Organisation;
}) => {
  return (
    <div className="rounded-md p-4 border border-foreground/10 dark:border-dark-foreground/10 relative">
      <PopoverMenu
        className="absolute top-1 right-1"
        ariaLabel="Organisation actions"
        options={[
          <ViewOrganisationDrawer key="view-organisation" />,
          <EditOrganisationDrawer key="edit-organisation" />,
          <ArchiveOrganisationDrawer
            key="archive-organisation"
            disabled={organisation.owner}
          />,
        ]}
      />

      <div className="flex flex-col items-center gap-2">
        <span
          className="w-12 h-12 rounded-full overflow-hidden flex items-center justify-center"
          style={{ backgroundColor: organisation.brandColor }}
        >
          <Image
            src={organisation.logo ?? ''}
            alt={organisation.name}
            width={36}
            height={36}
          />
        </span>
        <h3 className="font-medium">{organisation.name}</h3>
      </div>
      {organisation.owner && (
        <span className="absolute bottom-1 right-1 bg-brand-primary dark:bg-secondary rounded-full p-1 text-white text-xs">
          <IconLockFilled />
        </span>
      )}
    </div>
  );
};
