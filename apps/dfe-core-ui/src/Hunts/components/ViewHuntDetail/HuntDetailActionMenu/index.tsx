import { ActionsMenu } from '@/core/components/ActionsMenu';
import { CloneHuntModal } from '@/Hunts/components/CloneHuntModal';
import { DeleteHuntModal } from '@/Hunts/components/DeleteHuntModal';
import { UpdateHuntDrawer } from '@/Hunts/components/UpdateHuntDrawer';
import { useListHuntsContext } from '@/Hunts/contexts/ListHuntsContext';
import { HuntCreateResponse } from '@/Hunts/hooks/useCreateHunt/types';
import { HUNT_DETAIL_QUERY_KEY } from '@/Hunts/hooks/useFetchHuntDetail';
import { HuntDetailResponse } from '@/Hunts/hooks/useFetchHuntDetail/types';
import { HuntUpdateResponse } from '@/Hunts/hooks/useUpdateHunt/types';
import { IconCopy, IconEdit, IconTrash } from '@repo/dfe-icons';
import { useQueryClient } from '@tanstack/react-query';
import { App, Button } from 'antd';

interface HuntDetailActionMenuProps {
  onEditSuccess?: (hunt: HuntUpdateResponse) => void;
  hunt: HuntDetailResponse;
}

export const HuntDetailActionMenu = ({
  hunt,
  onEditSuccess: onEditSuccessProp,
}: HuntDetailActionMenuProps) => {
  const { notification } = App.useApp();
  const { refetch: refetchHunts, setSelectedHuntName } = useListHuntsContext();

  const queryClient = useQueryClient();

  const onCloneSuccess = (hunt: HuntCreateResponse) => {
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

  const onEditSuccess = (hunt: HuntUpdateResponse) => {
    setSelectedHuntName(hunt.name);

    void queryClient.invalidateQueries({
      queryKey: HUNT_DETAIL_QUERY_KEY(hunt.name),
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
