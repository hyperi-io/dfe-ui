import { Drawer } from '@/core/components/Drawer';
import { RbacProtected } from '@/core/components/RbacProtected';
import { IconEye } from '@repo/dfe-icons';
import { Button } from 'antd';
import { useState } from 'react';
import { ViewOrganisationDetail } from './ViewOrganisationDetail';

export const ViewOrganisationDrawer = ({
  org_name,
  display_name,
}: {
  org_name: string;
  display_name: string;
}) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <RbacProtected action={RbacProtected.rbacActions.org_read}>
        <RbacProtected.Unrestricted>
          <Button
            type="text"
            aria-label={`View ${display_name} details`}
            icon={<IconEye />}
            onClick={() => setOpen(true)}
          >
            View Organisation Details
          </Button>
        </RbacProtected.Unrestricted>
        <RbacProtected.Restricted tooltip={{ show: true }}>
          <Button type="text" htmlType="button" icon={<IconEye />} disabled>
            View Organisation Details
          </Button>
        </RbacProtected.Restricted>
      </RbacProtected>

      <Drawer
        title="Organisation Details"
        open={open}
        onClose={() => setOpen(false)}
      >
        <ViewOrganisationDetail
          org_name={org_name}
          display_name={display_name}
        />
      </Drawer>
    </>
  );
};
