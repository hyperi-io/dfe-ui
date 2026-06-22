import { ActionsMenu } from '@/core/components/ActionsMenu';
// import { CloneHuntModal } from '@/Hunts/components/CloneHuntModal';
// import { DeleteHuntModal } from '@/Hunts/components/DeleteHuntModal';
// import { UpdateHuntDrawer } from '@/Hunts/components/UpdateHuntDrawer';
import { useListHuntsContext } from '@/Hunts/contexts/ListHuntsContext';
import { HuntCreateResponse } from '@/Hunts/hooks/useCreateHunt/types';
import { HuntDetailResponse } from '@/Hunts/hooks/useFetchHuntDetail/types';
import { HuntUpdateResponse } from '@/Hunts/hooks/useUpdateHunt/types';
import { App } from 'antd';

interface HuntDetailActionMenuProps {
  onEditSuccess?: (hunt: HuntUpdateResponse) => void;
  hunt: HuntDetailResponse;
}

export const HuntDetailActionMenu = ({
  hunt,
  onEditSuccess: _onEditSuccess,
}: HuntDetailActionMenuProps) => {
  const { notification } = App.useApp();
  const { refetch: refetchHunts, setSelectedHuntId } = useListHuntsContext();

  const _onCloneSuccess = (hunt: HuntCreateResponse) => {
    setSelectedHuntId(hunt.hunt_id);
    refetchHunts();
    notification.success({
      title: `Hunt ${hunt.hunt_id} cloned successfully`,
      placement: 'bottomLeft',
    });
  };

  const _onDeleteSuccess = () => {
    setSelectedHuntId(null);
    refetchHunts();
    notification.success({
      title: `Hunt ${hunt.hunt_id} deleted successfully`,
      placement: 'bottomLeft',
    });
  };

  return (
    <ActionsMenu
      placement="left"
      classNames={{
        menu: 'w-48 p-0',
      }}
    >
      <></>
      {/* <UpdateHuntDrawer
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
      /> */}
    </ActionsMenu>
  );
};
