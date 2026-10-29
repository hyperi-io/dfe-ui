import { CustomScrollbar } from '@/core/components/CustomScrollbar';
import { useFetchInfiniteFilteredSourceCatalogueTags } from '@/core/hooks/useFetchInfiniteFilteredSourceCatalogueTags';
import { useSetComponentHeight } from '@/core/hooks/useSetComponentHeight';
import { cn } from '@repo/dfe-shared-ui';
import { Button } from 'antd';

export const TagSelect = ({
  onChange,
}: {
  onChange: (tag: string) => void;
}) => {
  const {
    data: { items = [] } = {},
    hasNextPage,
    fetchNextPage,
  } = useFetchInfiniteFilteredSourceCatalogueTags({
    per_page: 9,
  });

  const { componentHeight } = useSetComponentHeight({
    offset: 650,
  });
  return (
    <CustomScrollbar height={componentHeight}>
      <ul className="grid grid-cols-3 gap-2">
        {items.map((item) => (
          <li key={item.id} className="flex justify-center">
            <button
              className={cn(
                'border border-gray-300 rounded-md p-2 w-full h-full',
              )}
              onClick={() => onChange(item.id)}
            >
              <h3 className="font-medium">{item.name}</h3>
              <p className="text-sm text-gray-500">{item.description}</p>
            </button>
          </li>
        ))}
        {hasNextPage && (
          <Button
            className="col-span-3"
            type="text"
            onClick={() => fetchNextPage()}
          >
            Load more
          </Button>
        )}
      </ul>
    </CustomScrollbar>
  );
};
