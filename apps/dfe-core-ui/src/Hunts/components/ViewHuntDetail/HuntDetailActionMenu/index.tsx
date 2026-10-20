import { ActionsMenu } from '@/core/components/ActionsMenu';
import { QUERY_KEYS } from '@/core/config/api/endpoints/queryKeys';
import { CloneHuntModal } from '@/Hunts/components/CloneHuntModal';
import { DeleteHuntModal } from '@/Hunts/components/DeleteHuntModal';
import { UpdateHuntDrawer } from '@/Hunts/components/UpdateHuntDrawer';
import { useListHuntsContext } from '@/Hunts/contexts/ListHuntsContext';
import { THuntCreateResponse } from '@/Hunts/hooks/useCreateHunt/types';
import { THuntDetailResponse } from '@/Hunts/hooks/useFetchHuntDetail/types';
import { THuntUpdateResponse } from '@/Hunts/hooks/useUpdateHunt/types';
import { IconCopy, IconEdit, IconTrash } from '@repo/dfe-icons';
import { useQueryClient } from '@tanstack/react-query';
import { App, Button } from 'antd';

interface HuntDetailActionMenuProps {
  onEditSuccess?: (hunt: THuntUpdateResponse) => void;
  hunt: THuntDetailResponse;
}

export const HuntDetailActionMenu = ({
  hunt,
  onEditSuccess: onEditSuccessProp,
}: HuntDetailActionMenuProps) => {
  const { notification } = App.useApp();
  const { refetch: refetchHunts, setSelectedHuntName } = useListHuntsContext();

  const queryClient = useQueryClient();

  const onCloneSuccess = (hunt: THuntCreateResponse) => {
    setSelectedHuntName(hunt.name);
    refetchHunts();
    notification.success({
      title: `Hunt ${hunt.name} cloned successfully`,
      placement: 'bottomLeft',
    });
  };

  const onDeleteSuccess = () => {
    setSelectedHuntName(null);
    refetchHunts();
    notification.success({
      title: `Hunt ${hunt.name} deleted successfully`,
      placement: 'bottomLeft',
    });
  };

  const onEditSuccess = (hunt: THuntUpdateResponse) => {
    setSelectedHuntName(hunt.name);

    void queryClient.invalidateQueries({
      queryKey: QUERY_KEYS.hunts.hunt({ name: hunt.name }),
    });

    notification.success({
      title: `Hunt ${hunt.name} updated successfully`,
      placement: 'bottomLeft',
    });
    onEditSuccessProp?.(hunt);
  };

  return (
    <ActionsMenu
      placement="left"
      classNames={{
        menu: 'w-48 p-0',
      }}
    >
      <></>
      <UpdateHuntDrawer
        key="update-hunt"
        hunt={hunt}
        trigger={
          <Button
            className="flex items-center justify-start"
            type="text"
            icon={<IconEdit />}
            aria-label="Edit Hunt"
          >
            Edit Hunt
          </Button>
        }
        onSuccess={onEditSuccess}
      />
      <CloneHuntModal
        key="clone-hunt"
        hunt={hunt}
        trigger={
          <Button
            className="flex items-center justify-start"
            type="text"
            icon={<IconCopy />}
            aria-label="Clone Hunt"
          >
            Clone Hunt
          </Button>
        }
        onSuccess={onCloneSuccess}
      />

      <DeleteHuntModal
        key="delete-hunt"
        hunt={hunt}
        trigger={
          <Button
            className="flex items-center justify-start"
            type="text"
            icon={<IconTrash />}
            aria-label="Delete Hunt"
          >
            Delete Hunt
          </Button>
        }
        onSuccess={onDeleteSuccess}
      />
    </ActionsMenu>
  );
};
