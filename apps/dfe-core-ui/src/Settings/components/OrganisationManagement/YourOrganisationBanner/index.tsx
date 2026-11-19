import { SectionCard } from '@/core/components/SectionCard';
import { useFetchYourOrganisation } from '@/core/hooks/useFetchYourOrganisation';
import { EditOrganisationDrawer } from '@/Settings/components/OrganisationManagement/EditOrganisationDrawer';
import { ViewOrganisationDrawer } from '@/Settings/components/OrganisationManagement/ViewOrganisationDrawer';
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
      title={
        <>
          {label}
          <Tag color="blue" className="m-0">
            Your organisation
          </Tag>
        </>
      }
      description={`The organisation running this platform (${name}).`}
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
