import { GenericErrorCard } from '@/core/components/GenericError';
import {
  CreateUpdateRoleForm,
  CreateUpdateRoleFormData,
} from '@/Settings/components/RoleManagement/CreateUpdateRoleForm';
import { useFetchRoleDetail } from '@/Settings/hooks/roles/useFetchRoleDetail';
import { Spin } from 'antd';

export type UpdateRoleFormData = Omit<CreateUpdateRoleFormData, 'name'> & {
  name: undefined;
};
export const UpdateRoleForm = ({
  role_name,
  onFinish,
  error,
  isPending,
}: {
  role_name: string;
  onFinish: (values: UpdateRoleFormData) => void;
  error: Error | null;
  isPending: boolean;
}) => {
  const {
    data: roleDetailData,
    isLoading: isFetchingRoleDetail,
    error: fetchRoleDetailError,
  } = useFetchRoleDetail({ role_name });

  const handleFinish = (values: CreateUpdateRoleFormData) => {
    onFinish({ ...values, name: undefined });
  };

  if (isFetchingRoleDetail) {
    return (
      <>
        <Spin /> <p className="sr-only">Loading {role_name} details</p>
      </>
    );
  }
  if (fetchRoleDetailError) {
    return (
      <GenericErrorCard
        title="Error fetching role detail"
        description={fetchRoleDetailError.message}
      />
    );
  }

  return (
    <CreateUpdateRoleForm
      name={`update-role-form-${role_name}`}
      onFinish={handleFinish}
      error={error}
      isPending={isPending}
      initialValues={roleDetailData}
      disabledFields={{
        name: true,
      }}
      buttonLabel="Update Role"
    />
  );
};
