import { Drawer } from '@/core/components/Drawer';
import { RbacProtected } from '@/core/components/RbacProtected';
import { TOidcProviderListItem } from '@/Settings/hooks/oidcProviders/useFetchInfiniteFilteredOidcProviders/types';
import { IconEye } from '@repo/dfe-icons';
import { Button, Tabs } from 'antd';
import { useState } from 'react';
import { ViewOidcProviderDetail } from './ViewOidcProviderDetail';
import { ViewOidcUserAccounts } from './ViewOidcUserAccounts';

export const ViewOidcProviderDrawer = ({
  oidcProvider,
}: {
  oidcProvider: TOidcProviderListItem;
}) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <RbacProtected action={RbacProtected.rbacActions.oidc_read}>
        <RbacProtected.Unrestricted>
          <Button
            type="text"
            aria-label={`View ${oidcProvider.name} details`}
            icon={<IconEye />}
            onClick={() => setOpen(true)}
          >
            View OIDC Provider Details
          </Button>
        </RbacProtected.Unrestricted>
        <RbacProtected.Restricted tooltip={{ show: true }}>
          <Button type="text" htmlType="button" icon={<IconEye />} disabled>
            View OIDC Provider Details
          </Button>
        </RbacProtected.Restricted>
      </RbacProtected>

      <Drawer
        title="OIDC Provider Details"
        open={open}
        onClose={() => setOpen(false)}
        size="60%"
      >
        <Tabs
          items={[
            {
              label: 'Details',
              key: 'details',
              children: <ViewOidcProviderDetail oidcProvider={oidcProvider} />,
            },
            {
              label: 'Users',
              key: 'users',
              children: (
                <ViewOidcUserAccounts oidcProviderId={oidcProvider.name} />
              ),
            },
          ]}
        />
      </Drawer>
    </>
  );
};
