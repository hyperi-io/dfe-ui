import { ActionsMenu } from '@/core/components/ActionsMenu';
import { DeleteDeploymentModal } from '@/Services/components/deployments/DeleteDeploymentModal';
import { UpdateDeploymentDrawer } from '@/Services/components/deployments/UpdateDeploymentDrawer';
import { ValidateDeploymentModal } from '@/Services/components/deployments/ValidateDeploymentModal';
import { useListDeploymentsContext } from '@/Services/contexts/ListDeploymentsContext';
import { TDeploymentDetailResponse } from '@/Services/hooks/deployments/useFetchDeploymentDetail/types';
import { IconBadge, IconEdit, IconTrash } from '@repo/dfe-icons';
import { Button } from 'antd';

interface DeploymentActionMenuProps {
  serviceDeployment: TDeploymentDetailResponse;
}

export const DeploymentActionMenu = ({
  serviceDeployment: { config, service, instance },
}: DeploymentActionMenuProps) => {
  const { setSelectedDeployment } = useListDeploymentsContext();
  return (
    <ActionsMenu
      placement="left"
      classNames={{
        menu: 'w-56 p-0',
      }}
    >
      <UpdateDeploymentDrawer
        key="edit-deployment"
        serviceDeployment={{ config, service, instance }}
        trigger={
          <Button
            className="flex items-center justify-start"
            type="text"
            icon={<IconEdit />}
            aria-label="Edit Deployment"
          >
            Edit Deployment
          </Button>
        }
      />

      <ValidateDeploymentModal
        key="validate-deployment"
        serviceName={service}
        serviceInstanceName={instance}
        trigger={
          <Button
            className="flex items-center justify-start"
            type="text"
            icon={<IconBadge />}
            aria-label="Validate Deployment"
          >
            Validate Deployment
          </Button>
        }
      />

      <DeleteDeploymentModal
        key="delete-deployment"
        service={service}
        instance={instance}
        trigger={
          <Button
            className="flex items-center justify-start"
            type="text"
            icon={<IconTrash />}
            aria-label="Delete Deployment"
          >
            Delete Deployment
          </Button>
        }
        onSuccess={() => {
          setSelectedDeployment({
            service_name: null,
            service_instance: null,
          });
        }}
      />
    </ActionsMenu>
  );
};
