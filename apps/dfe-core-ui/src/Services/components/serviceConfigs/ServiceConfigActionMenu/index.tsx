import { ActionsMenu } from '@/core/components/ActionsMenu';
import { DeleteServiceConfigModal } from '@/Services/components/serviceConfigs/DeleteServiceConfigModal';
import { useListServicesContext } from '@/Services/contexts/ListServicesContext';
import { IconTrash } from '@repo/dfe-icons';
import { Button } from 'antd';

interface ServiceConfigActionMenuProps {
  serviceConfigName: string;
  serviceConfigInstanceName: string;
}

export const ServiceConfigActionMenu = ({
  serviceConfigName,
  serviceConfigInstanceName,
}: ServiceConfigActionMenuProps) => {
  const { setSelectedService } = useListServicesContext();
  return (
    <ActionsMenu
      placement="left"
      classNames={{
        menu: 'w-48 p-0',
      }}
    >
      <DeleteServiceConfigModal
        key="delete-service-config"
        serviceConfigName={serviceConfigName}
        serviceConfigInstanceName={serviceConfigInstanceName}
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
