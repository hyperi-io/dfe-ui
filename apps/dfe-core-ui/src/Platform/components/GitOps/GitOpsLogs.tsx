import { SectionCard } from '@/core/components/SectionCard';
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

  return (
    <SectionCard
      title="Git Operations: Log"
      className="border-none max-h-[calc(100vh-250px)] css-custom-scrollbar overflow-x-hidden"
    >
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
  );
};
