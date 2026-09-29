import { CustomScrollbar } from '@/core/components/CustomScrollbar';
import { SectionCard } from '@/core/components/SectionCard';
import { useSetComponentHeight } from '@/core/hooks/useSetComponentHeight';
import { useFetchGitOpsLog } from '@/Platform/hooks/gitops/useFetchGitOpsLog';
import { Spin } from 'antd';
import { GitOpsLogsCard } from './GitOpsLogsCard';

export const GitOpsLogs = () => {
  const {
    data: { entries },
    isLoading: isGitOpsLogLoading,
    error: gitOpsLogError,
    isFetchingNextPage,
    loadMoreRef,
  } = useFetchGitOpsLog();

  const { componentHeight } = useSetComponentHeight({
    offset: 280,
  });

  return (
    <CustomScrollbar height={componentHeight}>
      <SectionCard title="Git Operations: Log" className="border-none">
        {isGitOpsLogLoading && (
          <>
            <Spin /> <span className="sr-only">Loading GitOps Log...</span>
          </>
        )}
        {gitOpsLogError && <div>Error: {gitOpsLogError.message}</div>}
        {!isGitOpsLogLoading &&
          entries.map((item) => (
            <GitOpsLogsCard key={item.sha} dataItem={item} />
          ))}
        <div ref={loadMoreRef} className="h-4 flex justify-center">
          {isFetchingNextPage && <Spin size="small" />}
        </div>
      </SectionCard>
    </CustomScrollbar>
  );
};
