import { useReauthGrant } from '@/core/hooks/useReauthGrant';
import {
  CreateUpdateOrganisationForm,
  CreateUpdateOrganisationFormData,
} from '@/core/components/CreateUpdateOrganisationForm';
import { Drawer } from '@/core/components/Drawer';
import { RbacProtected } from '@/core/components/RbacProtected';
import { QUERY_KEYS } from '@/core/config/api/endpoints/queryKeys';
import { TOrganisationListSummary } from '@/core/hooks/useFetchInfiniteFilteredOrganisations/types';
import { useUpdateOrganisation } from '@/Settings/hooks/organisations/useUpdateOrganisation';
import { IconEdit } from '@repo/dfe-icons';
import { useQueryClient } from '@tanstack/react-query';
import { Button, ButtonProps, notification } from 'antd';
import { useState } from 'react';

export const EditOrganisationDrawer = ({
  organisation,
  buttonType = 'text',
}: {
  organisation: TOrganisationListSummary;
  buttonType?: ButtonProps['type'];
}) => {
  const [open, setOpen] = useState(false);
  const [api, contextHolder] = notification.useNotification();

  const queryClient = useQueryClient();

  const reauth = useReauthGrant(organisation.name, 'org');
  const {
    mutate: updateOrganisation,
    isPending,
    error,
    reset,
  } = useUpdateOrganisation({
    org_name: organisation.name,
    reauth: reauth.grant,
    onSuccess: () => {
      reauth.drop();
      api.success({
        title: 'Organisation updated successfully',
        placement: 'bottomLeft',
      });
      close();
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.orgs.org({ name: organisation.name }),
      });
    },
  });

  // A refusal belongs to the attempt that drew it, not to the next opening.
  function close() {
    setOpen(false);
    reset();
  }

  const handleUpdateOrganisation = (
    values: CreateUpdateOrganisationFormData,
  ) => {
    const body = {
      display_name: values.display_name,
      org_ids: values.org_ids,
      enabled: organisation.enabled,
    };
    // The engine refuses a clashing ID before it asks for the password, so the password is asked for only when the engine says the change needs it.
    updateOrganisation(body, {
      onError: (refusal) => {
        if (reauth.askIfRequired(refusal, () => updateOrganisation(body))) {
          reset();
        }
      },
    });
  };
  return (
    <>
      {contextHolder}
      {reauth.modal}
      <RbacProtected action={RbacProtected.rbacActions.org_write}>
        <RbacProtected.Unrestricted>
          <Button
            type={buttonType}
            aria-label={`Edit ${organisation.display_name}`}
            icon={<IconEdit />}
            onClick={() => setOpen(true)}
          >
            Edit Organisation
          </Button>
        </RbacProtected.Unrestricted>
        <RbacProtected.Restricted tooltip={{ show: true }}>
          <Button
            type={buttonType}
            htmlType="button"
            icon={<IconEdit />}
            disabled
            aria-label={`Edit ${organisation.display_name}`}
          >
            Edit Organisation
          </Button>
        </RbacProtected.Restricted>
      </RbacProtected>

      <Drawer title="Edit Organisation" open={open} onClose={close}>
        <CreateUpdateOrganisationForm
          initialValues={{
            ...organisation,
            // The engine stamps an org with no IDs with its name, so show that.
            org_ids: organisation.org_ids?.length
              ? organisation.org_ids
              : [organisation.name],
          }}
          onFinish={handleUpdateOrganisation}
          error={error}
          isPending={isPending}
          disabledFields={{
            name: true,
          }}
        />
      </Drawer>
    </>
  );
};
