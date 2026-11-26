import { DeleteOrganisationModal } from '@/Settings/components/OrganisationManagement/DeleteOrganisationModal';
import { EditOrganisationDrawer } from '@/Settings/components/OrganisationManagement/EditOrganisationDrawer';
import { EnableDisableOrganisation } from '@/Settings/components/OrganisationManagement/EnableDisableOrganisation';
import { ViewOrganisationDrawer } from '@/Settings/components/OrganisationManagement/ViewOrganisationDrawer';
import { PopoverMenu } from '@/core/components/PopoverMenu';
import { TOrganisationListSummary } from '@/core/hooks/useFetchInfiniteFilteredOrganisations/types';
import { cn } from '@/core/utils/style';
import {
  TagList,
  TagOverflow,
} from '@/Settings/components/GroupManagement/GroupCard/TagList';
import { ORG_ID_TAG_CLASS, ORG_ID_TAG_LIMIT } from '@/Settings/helpers/orgIds';
import { Tag } from 'antd';

export const OrganisationCard = ({
  organisation,
}: {
  organisation: TOrganisationListSummary;
}) => {
  const orgIcon = (organisation.display_name || organisation.name)
    .charAt(0)
    .toUpperCase();
  const orgIds = organisation.org_ids ?? [];
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
          <EnableDisableOrganisation
            key="enable-disable-organisation"
            display_name={organisation.display_name}
            enabled={organisation.enabled}
            org_name={organisation.name}
          />,
          <DeleteOrganisationModal
            key="delete-organisation"
            org_name={organisation.name}
            display_name={organisation.display_name}
          />,
        ]}
      />

      <div className="flex flex-col items-center gap-2">
        <span
          className={cn(
            'w-12 h-12 rounded-full overflow-hidden flex items-center justify-center bg-brand-primary dark:bg-secondary',
            !organisation.enabled && 'opacity-40',
          )}
        >
          <p className="text-white text-sm">{orgIcon}</p>
        </span>
        <h3 className="flex items-center gap-2 font-medium">
          {organisation.display_name}
          {!organisation.enabled && <Tag className="m-0">Disabled</Tag>}
        </h3>
      </div>

      {/* One row: capped tags shrink evenly to their ellipses before the row would wrap. */}
      <div className="flex items-center justify-center gap-1 mt-2 min-w-0">
        <ul className="flex flex-nowrap gap-1 min-w-0 overflow-hidden">
          <TagList
            items={orgIds}
            limit={ORG_ID_TAG_LIMIT}
            emptyLabel="No organisation IDs"
            tagClassName={ORG_ID_TAG_CLASS}
          />
        </ul>
        <TagOverflow count={orgIds.length} limit={ORG_ID_TAG_LIMIT} />
      </div>
    </div>
  );
};
