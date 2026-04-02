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
      {organisation.owner && (
        <span className="absolute top-1 right-1 bg-purple-800 rounded-full p-1 text-white text-xs">
          <IconLockFilled />
        </span>
      )}
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
    </div>
  );
};
