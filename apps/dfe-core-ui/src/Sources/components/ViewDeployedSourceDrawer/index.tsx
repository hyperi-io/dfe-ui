import { Drawer } from '@/core/components/Drawer';
import { NotificationCard } from '@/core/components/NotificationCard';
import { RbacProtected } from '@/core/components/RbacProtected';
import { DeployedSourceDetails } from '@/Sources/components/DeployedSourceDetails';
import { TSourceVersionDetail } from '@/Sources/hooks/useFetchSourceDetail/types';
import { IconEye } from '@repo/dfe-icons';
import { Button } from 'antd';
import { useState } from 'react';

export const ViewDeployedSourceDrawer = ({
  open,
  onClose,
  deploy_result,
  source_name,
  version,
}: {
  open?: boolean;
  onClose?: () => void;
  deploy_result: TSourceVersionDetail['version']['source_deployment'];
  source_name: string;
  version: string;
}) => {
  const title = `View Deployment for ${source_name}@${version}`;
  const [isDrawerVisible, setIsDrawerVisible] = useState(open);

  const handleClose = () => {
    setIsDrawerVisible(false);
    onClose?.();
  };

  return (
    <>
      <RbacProtected action={RbacProtected.rbacActions.source_read}>
        <RbacProtected.Unrestricted>
          <Button
            className="flex items-center gap-2"
            type="primary"
            onClick={() => setIsDrawerVisible(true)}
          >
            View Deployment <IconEye />
          </Button>
        </RbacProtected.Unrestricted>
        <RbacProtected.Restricted
          tooltip={{
            show: true,
            placement: 'bottom',
          }}
        >
          <Button
            className="flex items-center gap-2"
            type="primary"
            disabled
            onClick={() => setIsDrawerVisible(true)}
          >
            View Deployment <IconEye />
          </Button>
        </RbacProtected.Restricted>
      </RbacProtected>
      <Drawer
        title={title}
        open={isDrawerVisible}
        size="60%"
        onClose={handleClose}
      >
        <div className="flex flex-col gap-4">
          {deploy_result && (
            <DeployedSourceDetails
              data={deploy_result}
              isPending={false}
              error={null}
            />
          )}
          {!deploy_result && <NotificationCard title="No deployment found" />}
        </div>
      </Drawer>
    </>
  );
};
