import { cn } from '@/core/utils/style';
import {
  IconFileTypeCsv,
  IconFileTypeJson,
  IconFileTypeTxt,
  IconFileTypeUnknown,
} from '@dfe/icons';
import { Spin, Tooltip } from 'antd';
import { useListSourcesContext } from '../../contexts/ListSourcesContext';
import { EmptyList } from './EmptyList';
import { ErrorList } from './ErrorList';

const selectIcon = (
  header_type?: string | null,
  props?: { className?: string },
) => {
  switch (header_type) {
    case 'csv':
      return <IconFileTypeCsv {...props} />;
    case 'json':
      return <IconFileTypeJson {...props} />;
    case 'text':
      return <IconFileTypeTxt {...props} />;
    default:
      return <IconFileTypeUnknown {...props} />;
  }
};

export const SourceList = ({ className }: { className?: string }) => {
  const {
    data: { items: sources },
    error,
    loadMoreRef,
    isFetchingNextPage,
    selectedSourceName,
    setSelectedSourceName,
    filters,
    hasFilters,
    setFilters,
  } = useListSourcesContext();

  if (sources.length === 0) {
    return (
      <EmptyList
        className={className}
        hasFilters={hasFilters}
        setFilters={setFilters}
        defaultFilters={{
          ...filters,
          search: undefined,
          enabled: undefined,
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
        {sources.map((source) => (
          <li key={source.source} className="w-full pr-2">
            <Tooltip destroyOnHidden title={source.description}>
              <button
                className={cn(
                  'w-full text-left items-center flex [&_span]:w-full px-2 py-0.5',
                  selectedSourceName === source.source && 'bg-gray-100',
                )}
                onClick={() => {
                  setSelectedSourceName(source.source);
                }}
              >
                {selectIcon(source.header_type, {
                  className: 'flex text-xl mr-2',
                })}
                <dl>
                  <dt>{source.display_name}</dt>
                  <dd className="text-sm text-gray-500">{source.source}</dd>
                </dl>
              </button>
            </Tooltip>
          </li>
        ))}
        <div ref={loadMoreRef} className="h-4 flex justify-center">
          {isFetchingNextPage && <Spin size="small" />}
        </div>
      </>
    </ul>
  );
};
