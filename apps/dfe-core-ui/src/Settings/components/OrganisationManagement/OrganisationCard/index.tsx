import { Organisation } from '@/Settings/mocks/organisation.data';
import { IconLockFilled } from '@repo/dfe-icons';
import Image from 'next/image';
import { PopoverMenu } from '../../PopoverMenu';
import { ArchiveOrganisationDrawer } from '../ArchiveOrganisationDrawer';
import { EditOrganisationDrawer } from '../EditOrganisationDrawer';
import { ViewOrganisationDrawer } from '../ViewOrganisationDrawer';

export const OrganisationCard = ({
  organisation,
}: {
  organisation: Organisation;
}) => {
  return (
    <div className="rounded-md p-4 border border-foreground/10 dark:border-dark-foreground/10 relative">
      <PopoverMenu
        ariaLabel="Organisation actions"
        options={[
          <ViewOrganisationDrawer />,
          <EditOrganisationDrawer />,
          <ArchiveOrganisationDrawer disabled={organisation.owner} />,
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
