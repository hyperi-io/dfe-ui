import { RbacProtected } from '@/core/components/RbacProtected';
import { useUpdateGitOpsAutoMerge } from '@/Platform/hooks/gitops/useUpdateGitOpsAutoMerge';
import { Button, Tooltip } from 'antd';

export const EnableDisableAutoMergeButton = ({
  enabled,
}: {
  enabled: boolean;
}) => {
  const {
    mutate: mutateGitOpsAutoMerge,
    isPending: isUpdateGitOpsAutoMergePending,
    error: updateGitOpsAutoMergeError,
  } = useUpdateGitOpsAutoMerge();

  return (
    <RbacProtected action={RbacProtected.rbacActions.governance_write}>
      <RbacProtected.Unrestricted>
        {updateGitOpsAutoMergeError ? (
          <Tooltip destroyOnHidden title={updateGitOpsAutoMergeError.message}>
            <Button danger>Update GitOps Auto Merge Error</Button>
          </Tooltip>
        ) : (
          <Button
            classNames={{
              content: 'flex items-center gap-2',
            }}
            onClick={() =>
              mutateGitOpsAutoMerge(
                enabled ? { enabled: false } : { enabled: true },
              )
            }
            loading={isUpdateGitOpsAutoMergePending}
          >
            {enabled ? 'Disable Auto Merge' : 'Enable Auto Merge'}
          </Button>
        )}
      </RbacProtected.Unrestricted>
      <RbacProtected.Restricted tooltip={{ show: true }}>
        <Button disabled>Enable/Disable Auto Merge</Button>
      </RbacProtected.Restricted>
    </RbacProtected>
  );
};
