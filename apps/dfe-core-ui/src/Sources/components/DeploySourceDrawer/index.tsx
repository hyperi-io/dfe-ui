import { Drawer } from '@/core/components/Drawer';
import { RbacProtected } from '@/core/components/RbacProtected';
import { cn } from '@/core/utils/style';
import { DeployedSourceDetails } from '@/Sources/components/DeployedSourceDetails';
import { useDeploySource } from '@/Sources/hooks/useDeploySource';
import { usePlanSource } from '@/Sources/hooks/usePlanSource';
import { IconRocket } from '@repo/dfe-icons';
import { Button } from 'antd';
import { useState } from 'react';
import { PlanSourceDetails } from './PlanSourceDetails';

export const DeploySourceDrawer = ({
  open,
  onClose,
  source_name,
  version,
  classNames,
}: {
  open?: boolean;
  onClose?: () => void;
  source_name: string;
  version: string;
  classNames?: {
    button?: string;
  };
}) => {
  const title = 'Deploy Source';
  const [isDrawerVisible, setIsDrawerVisible] = useState(open);

  const handleClose = () => {
    setIsDrawerVisible(false);
    onClose?.();
  };

  const { mutate: planSourceMutation, ...planSourceData } = usePlanSource();

  const handleTriggerPlan = () => {
    setIsDrawerVisible(true);
    planSourceMutation({ name: source_name, version });
  };

  const { mutate: deployMutation, ...deploySourceData } = useDeploySource();

  return (
    <>
      <RbacProtected action={RbacProtected.rbacActions.source_deploy}>
        <RbacProtected.Unrestricted>
          <Button
            className={cn('flex items-center gap-2', classNames?.button)}
            type="primary"
            loading={planSourceData.isPending}
            onClick={() => handleTriggerPlan()}
          >
            Deploy <IconRocket />
          </Button>
        </RbacProtected.Unrestricted>
        <RbacProtected.Restricted
          tooltip={{
            show: true,
            placement: 'bottom',
          }}
        >
          <Button
            className={cn('flex items-center gap-2', classNames?.button)}
            type="primary"
            disabled
          >
            Deploy <IconRocket />
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
          {(deploySourceData.data || deploySourceData.error) && (
            <DeployedSourceDetails {...deploySourceData} />
          )}
          {!deploySourceData.data &&
            (planSourceData.data || planSourceData.error) && (
              <PlanSourceDetails
                {...planSourceData}
                source_name={source_name}
                version={version}
                onDeploy={deployMutation}
                isPending={deploySourceData.isPending}
              />
            )}
        </div>
      </Drawer>
    </>
  );
};
