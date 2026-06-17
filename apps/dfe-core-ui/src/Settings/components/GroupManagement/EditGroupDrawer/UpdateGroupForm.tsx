import { GenericErrorCard } from '@/core/components/GenericError';
import {
  CreateUpdateGroupForm,
  CreateUpdateGroupFormData,
} from '@/Settings/components/GroupManagement/CreateUpdateGroupForm';
import { useFetchGroupDetail } from '@/Settings/hooks/useFetchGroupDetail';
import { GroupUpdateRequestBody } from '@/Settings/hooks/useUpdateGroup/types';
import { Spin } from 'antd';

export type UpdateGroupFormData = GroupUpdateRequestBody;

export const UpdateGroupForm = ({
  group_name,
  onFinish,
  error,
  isPending,
}: {
  group_name: string;
  onFinish: (values: UpdateGroupFormData) => void;
  error: Error | null;
  isPending: boolean;
}) => {
  const {
    data: groupDetailData,
    isLoading: isFetchingGroupDetail,
    error: fetchGroupDetailError,
  } = useFetchGroupDetail({ group_name });

  const handleFinish = (values: CreateUpdateGroupFormData) => {
    onFinish({
      description: values.description,
      roles: values.roles,
      members: values.members ?? [],
    });
  };

  if (isFetchingGroupDetail) {
    return (
      <>
        <Spin /> <p className="sr-only">Loading {group_name} details</p>
      </>
    );
  }

  if (fetchGroupDetailError) {
    return (
      <GenericErrorCard
        title="Error fetching group detail"
        description={fetchGroupDetailError.message}
      />
    );
  }

  if (!groupDetailData) {
    return null;
  }

  return (
    <CreateUpdateGroupForm
      name={`update-group-form-${group_name}`}
      onFinish={handleFinish}
      error={error}
      isPending={isPending}
      initialValues={{
        name: groupDetailData.name,
        description: groupDetailData.description,
        roles: groupDetailData.roles,
        members: groupDetailData.members,
      }}
      disabledFields={{
        name: true,
      }}
      buttonLabel="Update Group"
      showMembersField
    />
  );
};
