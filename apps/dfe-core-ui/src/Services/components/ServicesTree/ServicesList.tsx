import { cn } from '@/core/utils/style';
import { useListServicesContext } from '@/Services/contexts/ListServicesContext';
import { TServiceSummary } from '@/Services/hooks/useFetchInfiniteFilteredServices/types';
import { Spin } from 'antd';
import { EmptyList } from './EmptyList';
import { ErrorList } from './ErrorList';

export const ServicesList = ({ className }: { className?: string }) => {
  const {
    data: { items: services },
    error,
    loadMoreRef,
    isFetchingNextPage,
    selectedService,
    setSelectedService,
    filters,
    hasFilters,
    setFilters,
  } = useListServicesContext();

  if (services.length === 0) {
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
    <ul
      className={cn(
        'h-[calc(100vh-175px)] css-custom-scrollbar flex flex-col gap-2 pt-2',
        className,
      )}
    >
      <>
        {services.map((service: TServiceSummary) => {
          const isSelected =
            selectedService?.service_name === service.service &&
            selectedService?.service_instance === service.instance;
          return (
            <li
              key={`${service.service}-${service.instance ?? '_default'}`}
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
                    setSelectedService({
                      service_name: service.service ?? null,
                      service_instance: service.instance ?? null,
                    });
                  }}
                >
                  <dl>
                    <dt className="truncate ellipsis">{service.service}</dt>
                    <dd className="text-sm text-gray-500 dark:text-gray-400 truncate ellipsis">
                      {service.instance ?? 'default'}
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
  );
};
