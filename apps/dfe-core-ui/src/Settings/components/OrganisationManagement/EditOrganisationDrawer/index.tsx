import { Drawer } from '@/core/components/Drawer';
import { RbacProtected } from '@/core/components/RbacProtected';
import { TOrganisationListSummary } from '@/core/hooks/useFetchInfiniteFilteredOrganisations/types';
import {
  CreateUpdateOrganisationForm,
  CreateUpdateOrganisationFormData,
} from '@/Settings/components/OrganisationManagement/CreateUpdateOrganisationForm';
import { ORGANISATION_DETAIL_QUERY_KEY } from '@/Settings/hooks/useFetchOrganisationDetail';
import { useUpdateOrganisation } from '@/Settings/hooks/useUpdateOrganisation';
import { IconEdit } from '@repo/dfe-icons';
import { useQueryClient } from '@tanstack/react-query';
import { Button, notification } from 'antd';
import { useState } from 'react';

export const EditOrganisationDrawer = ({
  organisation,
  refetch,
}: {
  organisation: TOrganisationListSummary;
  refetch: () => void;
}) => {
  const [open, setOpen] = useState(false);
  const [api, contextHolder] = notification.useNotification();

  const queryClient = useQueryClient();

  const {
    mutate: updateOrganisation,
    isPending,
    error,
  } = useUpdateOrganisation({
    org_name: organisation.name,
    onSuccess: () => {
      refetch();
      api.success({
        title: 'Organisation updated successfully',
        placement: 'bottomLeft',
      });
      setOpen(false);
      void queryClient.invalidateQueries({
        queryKey: ORGANISATION_DETAIL_QUERY_KEY(organisation.name),
      });
    },
  });

  const handleUpdateOrganisation = (
    values: CreateUpdateOrganisationFormData,
  ) => {
    updateOrganisation({
      display_name: values.display_name,
      org_ids: values.org_ids,
      enabled: organisation.enabled,
    });
  };
  return (
    <>
      {contextHolder}
      <RbacProtected action={RbacProtected.rbacActions.org_write}>
        <RbacProtected.Unrestricted>
          <Button
            type="text"
            aria-label={`Edit ${organisation.display_name}`}
            icon={<IconEdit />}
            onClick={() => setOpen(true)}
          >
            Edit Organisation
          </Button>
        </RbacProtected.Unrestricted>
        <RbacProtected.Restricted tooltip={{ show: true }}>
          <Button type="text" htmlType="button" icon={<IconEdit />} disabled>
            Edit Organisation
          </Button>
        </RbacProtected.Restricted>
      </RbacProtected>

      <Drawer
        title="Edit Organisation"
        open={open}
        onClose={() => setOpen(false)}
      >
        <CreateUpdateOrganisationForm
          initialValues={organisation}
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
