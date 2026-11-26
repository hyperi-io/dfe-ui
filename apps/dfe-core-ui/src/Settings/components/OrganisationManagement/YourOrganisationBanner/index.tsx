import { SectionCard } from '@/core/components/SectionCard';
import { Tooltip } from '@/core/components/Tooltip';
import { useFetchYourOrganisation } from '@/core/hooks/useFetchYourOrganisation';
import {
  TagList,
  TagOverflow,
} from '@/Settings/components/GroupManagement/GroupCard/TagList';
import { EditOrganisationDrawer } from '@/Settings/components/OrganisationManagement/EditOrganisationDrawer';
import { ViewOrganisationDrawer } from '@/Settings/components/OrganisationManagement/ViewOrganisationDrawer';
import { ORG_ID_TAG_CLASS, ORG_ID_TAG_LIMIT } from '@/Settings/helpers/orgIds';
import { useFetchOrganisationDetail } from '@/Settings/hooks/organisations/useFetchOrganisationDetail';
import { Tag } from 'antd';

/** Your organisation, the one running this platform, above the ones you serve. */
export const YourOrganisationBanner = () => {
  const { data: yours, isLoading, error } = useFetchYourOrganisation();
  const { data: organisation } = useFetchOrganisationDetail({
    org_name: yours?.name,
  });

  const name = yours?.name;
  // Setup names your organisation before this page is reachable, and a caller without system-wide org:read is refused the route.
  if (isLoading || error || !name) return null;

  const label = organisation?.display_name || name;

  return (
    <SectionCard
      // pb-4 gives back the tags' mt-2, keeping this divider level with the first one on the other Settings tabs.
      className="pb-4"
      title={
        <>
          {label}
          <Tooltip
            styles={{ root: { maxWidth: 'none' } }}
            title="The organisation running this platform."
          >
            <Tag color="blue" className="m-0">
              Your organisation
            </Tag>
          </Tooltip>
        </>
      }
      description={
        organisation && (
          <div className="flex items-center gap-2 mt-2 text-foreground dark:text-dark-foreground">
            <ul className="flex flex-nowrap gap-2 min-w-0 overflow-hidden">
              <TagList
                items={organisation.org_ids}
                limit={ORG_ID_TAG_LIMIT}
                emptyLabel="No organisation IDs"
                tagClassName={ORG_ID_TAG_CLASS}
              />
            </ul>
            <TagOverflow
              count={organisation.org_ids.length}
              limit={ORG_ID_TAG_LIMIT}
            />
          </div>
        )
      }
      rightTitleSlot={
        organisation && (
          <div className="flex gap-2">
            <ViewOrganisationDrawer
              buttonType="default"
              display_name={organisation.display_name}
              org_name={organisation.name}
            />
            <EditOrganisationDrawer
              buttonType="default"
              organisation={organisation}
            />
          </div>
        )
      }
    />
  );
};
