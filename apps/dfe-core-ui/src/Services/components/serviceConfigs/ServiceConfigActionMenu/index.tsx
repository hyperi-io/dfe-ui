import { ActionsMenu } from '@/core/components/ActionsMenu';
import { DeleteServiceConfigModal } from '@/Services/components/serviceConfigs/DeleteServiceConfigModal';
import { UpdateServiceConfigDrawer } from '@/Services/components/serviceConfigs/UpdateServiceConfigDrawer';
import { useListServicesContext } from '@/Services/contexts/ListServicesContext';
import { TFetchServiceConfigDetailResponse } from '@/Services/hooks/serviceConfigs/useFetchServiceConfigDetail/types';
import { IconEdit, IconTrash } from '@repo/dfe-icons';
import { Button } from 'antd';

interface ServiceConfigActionMenuProps {
  serviceConfig: TFetchServiceConfigDetailResponse;
}

export const ServiceConfigActionMenu = ({
  serviceConfig: { config, service, instance },
}: ServiceConfigActionMenuProps) => {
  const { setSelectedService } = useListServicesContext();
  return (
    <ActionsMenu
      placement="left"
      classNames={{
        menu: 'w-48 p-0',
      }}
    >
      <UpdateServiceConfigDrawer
        key="edit-service-config"
        serviceConfig={{ config, service, instance }}
        trigger={
          <Button
            className="flex items-center justify-start"
            type="text"
            icon={<IconEdit />}
            aria-label="Edit Service Config"
          >
            Edit Service Config
          </Button>
        }
      />

      <DeleteServiceConfigModal
        key="delete-service-config"
        serviceConfigName={service}
        serviceConfigInstanceName={instance}
        trigger={
          <Button
            className="flex items-center justify-start"
            type="text"
            icon={<IconTrash />}
            aria-label="Delete Service Config"
          >
            Delete Service Config
          </Button>
        }
        onSuccess={() => {
          setSelectedService({
            service_name: null,
            service_instance: null,
          });
        }}
      />
    </ActionsMenu>
  );
};
