import { Drawer } from '@/core/components/Drawer';
import { RbacProtected } from '@/core/components/RbacProtected';
import { TOidcProviderListItem } from '@/Settings/hooks/oidcProviders/useFetchInfiniteFilteredOidcProviders/types';
import { IconEye } from '@repo/dfe-icons';
import { Button } from 'antd';
import { useState } from 'react';
import { ViewOidcProviderDetail } from './ViewOidcProviderDetail';

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
      >
        <ViewOidcProviderDetail oidcProvider={oidcProvider} />
      </Drawer>
    </>
  );
};
