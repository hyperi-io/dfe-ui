import { CustomScrollbar } from '@/core/components/CustomScrollbar';
import { useSetComponentHeight } from '@/core/hooks/useSetComponentHeight';
import { cn } from '@/core/utils/style';
import { useListDeploymentsContext } from '@/Services/contexts/ListDeploymentsContext';
import { TDeploymentsItemSummary } from '@/Services/hooks/deployments/useFetchInfiniteFilteredDeployments/types';
import { Spin } from 'antd';
import { EmptyList } from './EmptyList';
import { ErrorList } from './ErrorList';

export const DeploymentsList = ({ className }: { className?: string }) => {
  const {
    data: { items: deployments },
    error,
    loadMoreRef,
    isFetchingNextPage,
    selectedDeployment,
    setSelectedDeployment,
    filters,
    hasFilters,
    setFilters,
  } = useListDeploymentsContext();

  const { componentHeight } = useSetComponentHeight({
    offset: 175,
  });

  if (deployments.length === 0) {
    return (
      <EmptyList
        className={className}
        hasFilters={hasFilters}
        setFilters={setFilters}
        defaultFilters={{
          ...filters,
          search: undefined,
          service: undefined,
        }}
      />
    );
  }

  if (error) {
    return <ErrorList className={className} message={error.message} />;
  }

  return (
    <CustomScrollbar height={componentHeight}>
      <ul className={cn('flex flex-col gap-2 pt-2', className)}>
        <>
          {deployments.map((deployment: TDeploymentsItemSummary) => {
            const isSelected =
              selectedDeployment?.service_name === deployment.service &&
              selectedDeployment?.service_instance === deployment.instance;
            return (
              <li
                key={`${deployment.service}-${deployment.instance ?? '_default'}`}
                className="w-full"
              >
                <div className="flex items-center gap-2">
                  <button
                    className={cn(
                      'overflow-hidden',
                      'hover:bg-gray-100 dark:hover:bg-gray-800 w-full text-left items-center flex [&_span]:w-full px-2 py-0.5 hover:cursor-pointer rounded-md',
                      isSelected && 'bg-gray-200 dark:bg-gray-700',
                    )}
                    onClick={() => {
                      setSelectedDeployment({
                        service_name: deployment.service ?? null,
                        service_instance: deployment.instance ?? null,
                      });
                    }}
                  >
                    <dl>
                      <dt className="truncate ellipsis">
                        {deployment.service}
                      </dt>
                      <dd className="text-sm text-gray-500 dark:text-gray-400 truncate ellipsis">
                        {deployment.instance ?? 'default'}
                      </dd>
                    </dl>
                  </button>
                </div>
              </li>
            );
          })}
          <div ref={loadMoreRef} className="h-4 flex justify-center">
            {isFetchingNextPage && <Spin size="small" />}
          </div>
        </>
      </ul>
    </CustomScrollbar>
  );
};
