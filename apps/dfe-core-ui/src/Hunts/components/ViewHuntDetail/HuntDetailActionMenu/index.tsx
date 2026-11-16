import { ActionsMenu } from '@/core/components/ActionsMenu';
import { ApiErrorNotification } from '@/core/components/ApiErrorNotification';
import { RbacProtected } from '@/core/components/RbacProtected';
import { QUERY_KEYS } from '@/core/config/api/endpoints/queryKeys';
import { CloneHuntModal } from '@/Hunts/components/CloneHuntModal';
import { DeleteHuntModal } from '@/Hunts/components/DeleteHuntModal';
import { UpdateHuntDrawer } from '@/Hunts/components/UpdateHuntDrawer';
import { useListHuntsContext } from '@/Hunts/contexts/ListHuntsContext';
import { THuntCreateResponse } from '@/Hunts/hooks/useCreateHunt/types';
import { fetchHuntDetail } from '@/Hunts/hooks/useFetchHuntDetail/api';
import { THuntDetailResponse } from '@/Hunts/hooks/useFetchHuntDetail/types';
import { useHuntRunState } from '@/Hunts/hooks/useHuntRunState';
import { useUpdateHunt } from '@/Hunts/hooks/useUpdateHunt';
import { THuntUpdateResponse } from '@/Hunts/hooks/useUpdateHunt/types';
import {
  transformHuntDetailToFormData,
  transformHuntFormDataToUpdateRequest,
} from '@/Hunts/utils/transformHuntData/transformHuntDetailToFormData';
import {
  IconCopy,
  IconEdit,
  IconPlayerPause,
  IconPlayerPlay,
  IconTrash,
} from '@repo/dfe-icons';
import { useQueryClient } from '@tanstack/react-query';
import { App, Button } from 'antd';
import { useRef, useState } from 'react';

interface HuntDetailActionMenuProps {
  onEditSuccess?: (hunt: THuntUpdateResponse) => void;
  hunt: THuntDetailResponse;
}

/** Disable, Enable, or Re-enable, which also clears a stop the runner made. */
const ToggleHuntEnabled = ({
  hunt,
  onSuccess,
}: {
  hunt: THuntDetailResponse;
  onSuccess: (hunt: THuntUpdateResponse) => void;
}) => {
  const { notification } = App.useApp();
  const queryClient = useQueryClient();
  const { enabled, autoDisabledAt } = useHuntRunState(hunt);
  const autoDisabled = autoDisabledAt != null;
  const turnOn = autoDisabled || enabled === false;
  const label = autoDisabled
    ? 'Re-enable Hunt'
    : turnOn
      ? 'Enable Hunt'
      : 'Disable Hunt';
  const Icon = turnOn ? IconPlayerPlay : IconPlayerPause;
  const huntLabel = hunt.display_name || hunt.name;

  const [isReading, setIsReading] = useState(false);
  // The direction the PUT carries, which the fresh read can change from the label's.
  const sent = useRef(turnOn);

  const onError = (error: Error) =>
    notification.error({
      title: `Hunt ${huntLabel} was not ${sent.current ? 'enabled' : 'disabled'}`,
      description: <ApiErrorNotification error={error} />,
      placement: 'bottomLeft',
    });

  const { mutate, isPending } = useUpdateHunt({
    name: hunt.name,
    onSuccess: async (response) => {
      onSuccess(response);
      // The notice waits for the refetch, so the row, header and menu no longer say Auto-disabled when it shows.
      await queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.hunts.default(),
      });
      notification.success({
        title: `Hunt ${huntLabel} ${sent.current ? 'enabled' : 'disabled'}`,
        placement: 'bottomLeft',
      });
    },
    onError,
  });

  // The engine has no per-field write, so a toggle sends the whole config, and a fresh read keeps it from undoing an edit landed since the page loaded.
  const toggle = async () => {
    sent.current = turnOn;
    setIsReading(true);
    try {
      const fresh = await fetchHuntDetail({ pathParams: { name: hunt.name } });
      sent.current = fresh.auto_disabled_at != null || fresh.enabled === false;
      mutate({
        ...transformHuntFormDataToUpdateRequest(
          transformHuntDetailToFormData(fresh),
          fresh,
        ),
        enabled: sent.current,
      });
    } catch (error) {
      onError(error instanceof Error ? error : new Error(String(error)));
    } finally {
      setIsReading(false);
    }
  };

  return (
    <RbacProtected action={RbacProtected.rbacActions.hunt_write}>
      <RbacProtected.Unrestricted>
        <Button
          className="flex items-center justify-start"
          type="text"
          icon={<Icon />}
          aria-label={label}
          loading={isReading || isPending}
          onClick={() => void toggle()}
        >
          {label}
        </Button>
      </RbacProtected.Unrestricted>
      <RbacProtected.Restricted
        className="justify-start opacity-100"
        tooltip={{ show: true, placement: 'left' }}
      >
        <Button
          className="flex items-center justify-start"
          type="text"
          icon={<Icon />}
          aria-label={label}
          disabled
        >
          {label}
        </Button>
      </RbacProtected.Restricted>
    </RbacProtected>
  );
};

export const HuntDetailActionMenu = ({
  hunt,
  onEditSuccess: onEditSuccessProp,
}: HuntDetailActionMenuProps) => {
  const { notification } = App.useApp();
  const { setSelectedHuntName } = useListHuntsContext();

  const queryClient = useQueryClient();

  const onCloneSuccess = (hunt: THuntCreateResponse) => {
    setSelectedHuntName(hunt.name);
    notification.success({
      title: `Hunt ${hunt.display_name || hunt.name} cloned successfully`,
      placement: 'bottomLeft',
    });
  };

  const onDeleteSuccess = () => {
    setSelectedHuntName(null);
    notification.success({
      title: `Hunt ${hunt.display_name || hunt.name} deleted successfully`,
      placement: 'bottomLeft',
    });
  };

  const onEditSuccess = (hunt: THuntUpdateResponse) => {
    setSelectedHuntName(hunt.name);

    void queryClient.invalidateQueries({
      queryKey: QUERY_KEYS.hunts.hunt({ name: hunt.name }),
    });

    // The edit drawer raises the success notice itself.
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
      <ToggleHuntEnabled
        key="toggle-hunt-enabled"
        hunt={hunt}
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
