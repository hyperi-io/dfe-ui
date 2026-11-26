import { Drawer, TABBED_DRAWER_STYLES } from '@/core/components/Drawer';
import { RbacProtected } from '@/core/components/RbacProtected';
import { FilteredAccounts } from '@/Settings/components/AccountManagement/FilteredAccounts';
import { OrgOidcProviders } from '@/Settings/components/OidcProviderManagement/OrgOidcProviders';
import { useIsYourOrg } from '@/Settings/hooks/organisations/useOrganisationLabels';
import { adminTabPath } from '@/Settings/scenes/AdminControls/adminTabs';
import { IconEye } from '@repo/dfe-icons';
import { Button, ButtonProps, Tabs } from 'antd';
import { useState } from 'react';
import { ViewOrganisationDetail } from './ViewOrganisationDetail';

export const ViewOrganisationDrawer = ({
  org_name,
  display_name,
  buttonType = 'text',
}: {
  org_name: string;
  display_name: string;
  buttonType?: ButtonProps['type'];
}) => {
  const [open, setOpen] = useState(false);
  const isYours = useIsYourOrg();
  // Your organisation's providers lead the provider page, and a customer's open under its filter.
  const providersHref = isYours(org_name)
    ? adminTabPath('oidc-provider-management')
    : `${adminTabPath('oidc-provider-management')}?${new URLSearchParams({ org: org_name })}`;

  return (
    <>
      <RbacProtected action={RbacProtected.rbacActions.org_read}>
        <RbacProtected.Unrestricted>
          <Button
            type={buttonType}
            aria-label={`View ${display_name} details`}
            icon={<IconEye />}
            onClick={() => setOpen(true)}
          >
            View Organisation Details
          </Button>
        </RbacProtected.Unrestricted>
        <RbacProtected.Restricted tooltip={{ show: true }}>
          <Button
            type={buttonType}
            htmlType="button"
            icon={<IconEye />}
            disabled
          >
            View Organisation Details
          </Button>
        </RbacProtected.Restricted>
      </RbacProtected>

      <Drawer
        title="Organisation Details"
        open={open}
        onClose={() => setOpen(false)}
        size="60%"
        styles={TABBED_DRAWER_STYLES}
        // Nothing here is edited, so there is nothing to lose by clicking away.
        preventClickaway={{ enabled: false }}
      >
        <Tabs
          items={[
            {
              label: 'Details',
              key: 'details',
              children: (
                <ViewOrganisationDetail
                  org_name={org_name}
                  display_name={display_name}
                />
              ),
            },
            {
              label: 'Users',
              key: 'users',
              children: (
                <FilteredAccounts
                  filter={{ org: org_name }}
                  manageHref={`${adminTabPath('account-management')}?${new URLSearchParams({ org: org_name })}`}
                />
              ),
            },
            {
              label: 'OIDC Providers',
              key: 'oidc-providers',
              children: (
                <OrgOidcProviders
                  manageHref={providersHref}
                  org={org_name}
                  readOnly
                />
              ),
            },
          ]}
        />
      </Drawer>
    </>
  );
};
