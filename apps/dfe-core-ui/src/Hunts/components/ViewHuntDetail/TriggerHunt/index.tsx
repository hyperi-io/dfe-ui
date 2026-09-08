import { FormNotification } from '@/core/components/FormNotification';
import { RbacProtected } from '@/core/components/RbacProtected';
import { useTriggerHunt } from '@/Hunts/hooks/useTriggerHunt';
import { IconPlayerPlay } from '@repo/dfe-icons';
import { App, Button, Modal } from 'antd';
import { useState } from 'react';

export const TriggerHunt = ({
  selectedHuntName,
}: {
  selectedHuntName: string;
}) => {
  const [isOpen, setIsOpen] = useState(false);

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
          <Button onClick={() => setIsOpen(true)}>
            Trigger On-Demand <IconPlayerPlay />
          </Button>
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
        onOk={() => triggerHunt()}
        okText="Trigger Hunt"
        confirmLoading={isPending}
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
