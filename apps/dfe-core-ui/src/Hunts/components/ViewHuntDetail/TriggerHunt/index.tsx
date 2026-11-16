import { FormNotification } from '@/core/components/FormNotification';
import { Modal } from '@/core/components/Modal';
import { RbacProtected } from '@/core/components/RbacProtected';
import { Tooltip } from '@/core/components/Tooltip';
import type { THuntDetailResponse } from '@/Hunts/hooks/useFetchHuntDetail/types';
import { useHuntRunState } from '@/Hunts/hooks/useHuntRunState';
import { useTriggerHunt } from '@/Hunts/hooks/useTriggerHunt';
import { IconPlayerPlay } from '@repo/dfe-icons';
import { App, Button } from 'antd';
import { useState } from 'react';

export const TriggerHunt = ({ hunt }: { hunt: THuntDetailResponse }) => {
  const selectedHuntName = hunt.name;
  const [isOpen, setIsOpen] = useState(false);
  const stopped = useHuntRunState(hunt).autoDisabledAt != null;

  const { notification } = App.useApp();

  const {
    mutate: triggerHunt,
    isPending,
    error,
    reset,
  } = useTriggerHunt({
    name: selectedHuntName,
    onSuccess: (data) => {
      setIsOpen(false);
      notification.success({
        title: 'On-demand run queued',
        description: `The runner picks it up within ${data.poll_seconds} seconds.`,
        placement: 'bottomLeft',
      });
    },
  });

  const close = () => {
    reset();
    setIsOpen(false);
  };

  return (
    <>
      <RbacProtected action={RbacProtected.rbacActions.hunt_execute}>
        <RbacProtected.Unrestricted>
          <Tooltip
            title={
              stopped
                ? 'The runner stopped this hunt. Re-enable it first.'
                : undefined
            }
          >
            <Button disabled={stopped} onClick={() => setIsOpen(true)}>
              Trigger On-Demand <IconPlayerPlay />
            </Button>
          </Tooltip>
        </RbacProtected.Unrestricted>
        <RbacProtected.Restricted tooltip={{ show: true }}>
          <Button disabled>
            Trigger On-Demand <IconPlayerPlay />
          </Button>
        </RbacProtected.Restricted>
      </RbacProtected>

      <Modal
        title="Trigger On-Demand Hunt"
        open={isOpen}
        onCancel={close}
        footer={
          <>
            <Button type="default" onClick={close}>
              Cancel
            </Button>
            <Button
              type="primary"
              onClick={() => triggerHunt()}
              loading={isPending}
              disabled={stopped}
            >
              Trigger Hunt
            </Button>
          </>
        }
      >
        <p>
          Queue <strong>{selectedHuntName}</strong> to run now. The run covers
          every customer the hunt is configured for.
        </p>
        {error && <FormNotification text={error.message} type="error" />}
      </Modal>
    </>
  );
};
