import { UseFetchInfiniteFilteredSourcesProps } from '@/Sources/hooks/useFetchInfiniteFilteredSources/types';
import { IconInfoCircle, IconPlus } from '@dfe/icons';
import { Button } from 'antd';
import { useRouter } from 'next/navigation';

export const EmptyList = ({
  hasFilters,
  setFilters,
}: {
  hasFilters: boolean;
  setFilters: (filters: UseFetchInfiniteFilteredSourcesProps) => void;
}) => {
  const router = useRouter();

  return (
    <div className="bg-background-muted dark:bg-dark-background-muted rounded-md p-4 flex items-center gap-6">
      <IconInfoCircle className="w-6 h-6 text-foreground" />
      <div className="flex flex-col">
        <h2 className="text-lg font-medium">
          {hasFilters ? 'No sources match your filters' : 'No sources found'}
        </h2>
        <p>
          {hasFilters
            ? 'Please update your filters to see sources.'
            : 'Please add a source to get started.'}
        </p>
      </div>
      {hasFilters ? (
        <Button
          className="ml-auto"
          type="default"
          onClick={() => setFilters({ search: undefined, enabled: undefined })}
        >
          Clear Filters
        </Button>
      ) : (
        <Button
          className="ml-auto"
          icon={<IconPlus />}
          type="primary"
          onClick={() => router.push('/sources/create')}
        >
          Add Source
        </Button>
      )}
    </div>
  );
};
