import { GenericErrorCard } from '@/core/components/GenericError';
import {
  CreateUpdateRoleForm,
  CreateUpdateRoleFormData,
} from '@/Settings/components/RoleManagement/CreateUpdateRoleForm';
import { useFetchRoleDetail } from '@/Settings/hooks/useFetchRoleDetail';
import { Spin } from 'antd';

export const CloneRoleForm = ({
  name,
  onFinish,
  role_name,
  error,
  isPending,
}: {
  name: string;
  onFinish: (values: CreateUpdateRoleFormData) => void;
  role_name: string;
  error: Error | null;
  isPending: boolean;
}) => {
  const {
    data: roleDetailData,
    isLoading: isFetchingRoleDetail,
    error: fetchRoleDetailError,
  } = useFetchRoleDetail({ role_name });

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
        title="Unable to clone role at this time"
        description={fetchRoleDetailError.message}
      />
    );
  }

  if (!roleDetailData) {
    return null;
  }

  const {
    name: _sourceName,
    resource_type: _resourceType,
    ...roleFields
  } = roleDetailData;

  return (
    <CreateUpdateRoleForm
      name={name}
      onFinish={onFinish}
      error={error}
      isPending={isPending}
      buttonLabel="Clone Role"
      initialValues={{
        ...roleFields,
        name: `${role_name}_copy`,
      }}
    />
  );
};
