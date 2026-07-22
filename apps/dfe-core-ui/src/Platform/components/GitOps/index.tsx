import { RbacProtected } from '@/core/components/RbacProtected';
import { SectionCard } from '@/core/components/SectionCard';
import { useFetchGitOpsAutoMerge } from '@/Platform/hooks/gitops/useFetchGitOpsAutoMerge';
import { Divider, Spin } from 'antd';
import { EnableDisableAutoMergeButton } from './EnableDisableAutoMergeButton';
import { GitOpsLogs } from './GitOpsLogs';

const dataListTermStyle = 'text-foreground/50 dark:text-foreground/50';

export const GitOps = () => {
  const {
    data: gitOpsAutoMerge,
    isLoading: isGitOpsAutoMergeLoading,
    error: gitOpsAutoMergeError,
  } = useFetchGitOpsAutoMerge();

  return (
    <SectionCard
      title="Git Operations: Auto Merge"
      rightTitleSlot={
        <EnableDisableAutoMergeButton
          enabled={gitOpsAutoMerge?.allowed ?? false}
        />
      }
    >
      <RbacProtected action={RbacProtected.rbacActions.governance_read}>
        <RbacProtected.Unrestricted>
          {isGitOpsAutoMergeLoading && (
            <>
              <Spin />{' '}
              <span className="sr-only">Loading GitOps Auto Merge...</span>
            </>
          )}
          {gitOpsAutoMergeError && (
            <div>Error: {gitOpsAutoMergeError.message}</div>
          )}
          {gitOpsAutoMerge && (
            <dl className="grid grid-cols-[auto_1fr_auto_1fr] gap-x-4 gap-y-2 text-xs">
              {gitOpsAutoMerge.stored && (
                <>
                  <dt className={dataListTermStyle}>Stored</dt>
                  <dd>{gitOpsAutoMerge.stored}</dd>
                </>
              )}
              {gitOpsAutoMerge.effective && (
                <>
                  <dt className={dataListTermStyle}>Effective</dt>
                  <dd>{gitOpsAutoMerge.effective}</dd>
                </>
              )}
              {gitOpsAutoMerge.allowed && (
                <>
                  <dt className={dataListTermStyle}>Allowed</dt>
                  <dd>{gitOpsAutoMerge.allowed ? 'Yes' : 'No'}</dd>
                </>
              )}
              {gitOpsAutoMerge.reason && (
                <>
                  <dt className={dataListTermStyle}>Reason</dt>
                  <dd>{gitOpsAutoMerge.reason}</dd>
                </>
              )}
            </dl>
          )}
          <Divider size="small" />
          <GitOpsLogs />
        </RbacProtected.Unrestricted>
        <RbacProtected.Restricted>
          <RbacProtected.RestrictedRoute />
        </RbacProtected.Restricted>
      </RbacProtected>
    </SectionCard>
  );
};
