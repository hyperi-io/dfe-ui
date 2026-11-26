import { useReauthGrant } from '@/core/hooks/useReauthGrant';
import { Modal } from '@/core/components/Modal';
import { RbacProtected } from '@/core/components/RbacProtected';
import { ReauthPanel } from '@/core/components/ReauthPanel';
import { useUpdateOrganisation } from '@/Settings/hooks/organisations/useUpdateOrganisation';
import { IconBan, IconCircleCheck } from '@repo/dfe-icons';
import { Button, notification } from 'antd';
import { useState } from 'react';

/** Disables an organisation from a confirmation that takes the password, or enables a disabled one after the password prompt. */
export const EnableDisableOrganisation = ({
  display_name,
  enabled,
  org_name,
}: {
  display_name: string;
  enabled: boolean;
  org_name: string;
}) => {
  const [confirming, setConfirming] = useState(false);
  const [notify, notices] = notification.useNotification();
  const actionTitle = enabled ? 'Disable Organisation' : 'Enable Organisation';
  const icon = enabled ? <IconBan /> : <IconCircleCheck />;

  // Disabling or enabling moves every account of the org, so it asks for the password.
  const reauth = useReauthGrant(
    org_name,
    'org',
    enabled ? 'disable' : 'enable',
  );
  const { mutate, isPending, error, reset } = useUpdateOrganisation({
    org_name,
    reauth: reauth.grant,
    onSuccess: () => {
      reauth.drop();
      setConfirming(false);
      notify.success({
        title: `${display_name} ${enabled ? 'disabled' : 'enabled'}`,
        placement: 'bottomLeft',
      });
    },
    // Enabling has no panel to show a refusal in.
    onError: (refusal) => {
      if (!enabled) {
        notify.error({
          title: `${display_name} could not be enabled`,
          description: refusal.message,
          placement: 'bottomLeft',
        });
      }
    },
  });

  const handleClick = () => {
    if (enabled) {
      setConfirming(true);
    } else {
      reauth.ask(() => mutate({ enabled: true }));
    }
  };

  const closeConfirm = () => {
    reset();
    setConfirming(false);
  };

  return (
    <RbacProtected action={RbacProtected.rbacActions.org_write}>
      {notices}
      {reauth.modal}
      <RbacProtected.Unrestricted>
        <Button
          aria-label={`${enabled ? 'Disable' : 'Enable'} ${display_name}`}
          type="text"
          icon={icon}
          loading={isPending && !confirming}
          onClick={handleClick}
        >
          {actionTitle}
        </Button>
        <Modal
          title={`Disable ${display_name}?`}
          open={confirming}
          destroyOnHidden
          onCancel={closeConfirm}
          footer={null}
        >
          <ReauthPanel
            confirmLabel="Disable"
            danger
            error={error}
            isPending={isPending}
            kind="org"
            target={org_name}
            onCancel={closeConfirm}
            onGranted={(grant) => {
              reauth.keep(grant);
              mutate({ enabled: false });
            }}
          >
            <p>
              Its accounts, API keys and ingest credentials stop working until
              you enable it again. Its data is kept.
            </p>
          </ReauthPanel>
        </Modal>
      </RbacProtected.Unrestricted>
      <RbacProtected.Restricted tooltip={{ show: true }}>
        <Button
          aria-label={`${enabled ? 'Disable' : 'Enable'} ${display_name}`}
          type="text"
          icon={icon}
          disabled
        >
          {actionTitle}
        </Button>
      </RbacProtected.Restricted>
    </RbacProtected>
  );
};
