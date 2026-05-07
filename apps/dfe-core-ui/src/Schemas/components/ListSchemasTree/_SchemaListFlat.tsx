import { cn } from '@/core/utils/style';
import { EmptyList } from '@/Schemas/components/ListSchemasTree/EmptyList';
import { ErrorList } from '@/Schemas/components/ListSchemasTree/ErrorList';
import { useListSchemasContext } from '@/Schemas/contexts/ListSchemasContext';
import { IconStarFilled } from '@repo/dfe-icons';
import { Spin, Tooltip, Tree, Typography } from 'antd';
import { useMemo } from 'react';
import Highlighter from 'react-highlight-words';

export const SchemaList = ({ className }: { className?: string }) => {
  const {
    data: { items: schemas },
    error,
    loadMoreRef,
    isFetchingNextPage,
    setSelectedSchemaPath,
    setSelectedSchemaVersion,
    filters,
    hasFilters,
    setFilters,
  } = useListSchemasContext();

  const treeData = useMemo(
    () =>
      schemas.map((schema) => ({
        key: schema.name,
        title: (
          <Typography.Text
            onClick={(e) => {
              e.stopPropagation();
              setSelectedSchemaPath(schema.name);
              setSelectedSchemaVersion(
                schema.current ?? schema.versions?.[0] ?? null,
                schema.name,
              );
            }}
            className="flex items-center overflow-hidden align-middle cursor-pointer gap-x-1 text-ellipsis whitespace-nowrap"
          >
            <Highlighter
              highlightClassName="bg-yellow-200"
              searchWords={[filters.search ?? '']}
              autoEscape
              textToHighlight={schema.name}
            />
          </Typography.Text>
        ),
        children: schema.versions?.map((version: string) => ({
          key: `${schema.name}.${version}`,
          title: (
            <Typography.Text
              onClick={(e) => {
                e.stopPropagation();
                setSelectedSchemaVersion(version, schema.name);
              }}
              className="cursor-pointer flex items-center gap-x-2"
            >
              {version}

              {version === schema.current ? (
                <Tooltip destroyOnHidden title="Current version">
                  <IconStarFilled className="text-yellow-500" />
                </Tooltip>
              ) : null}
            </Typography.Text>
          ),
        })),
      })),
    [schemas, setSelectedSchemaPath, filters.search, setSelectedSchemaVersion],
  );

  if (schemas.length === 0) {
    return (
      <EmptyList
        className={className}
        hasFilters={hasFilters}
        setFilters={setFilters}
        defaultFilters={{
          ...filters,
          search: undefined,
        }}
      />
    );
  }

  if (error) {
    return <ErrorList className={className} message={error.message} />;
  }

  return (
    <div
      className={cn(
        'h-[calc(100vh-175px)] css-custom-scrollbar flex flex-col gap-2 pt-2',
        className,
      )}
    >
      <Tree blockNode defaultExpandAll treeData={treeData} />
      <div ref={loadMoreRef} className="h-4 flex justify-center">
        {isFetchingNextPage && <Spin size="small" />}
      </div>
    </div>
  );
};
