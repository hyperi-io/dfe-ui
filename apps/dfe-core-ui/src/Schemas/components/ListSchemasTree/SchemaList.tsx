import { useListSchemasContext } from '@/core/contexts/ListSchemasContext';
import { cn } from '@/core/utils/style';
import { EmptyList } from '@/Schemas/components/ListSchemasTree/EmptyList';
import { ErrorList } from '@/Schemas/components/ListSchemasTree/ErrorList';
import { Spin, Tree } from 'antd';
import { useCallback, useMemo, useState } from 'react';
import { useTransformMetaSchemaToTree } from './hooks/useTransformMetaSchemaToTree';

const META_ROOT_PATH_SEGMENTS = ['meta'];
const EMPTY_PATH_SEGMENTS: string[] = [];

export const SchemaList = ({ className }: { className?: string }) => {
  const {
    data: { items: metaSchemas, objects: schemaObjectsResponse },
    error,
    isLoading,
    loadMoreRef,
    isFetchingNextPage,
    setSelectedSchema,
    selectedSchemaPath,
    selectedSchemaVersion,
    filters,
    hasFilters,
    setFilters,
    schemaTypesScope,
  } = useListSchemasContext();

  const hasOnlyMetaSchemas =
    schemaTypesScope?.length === 1 && schemaTypesScope[0] === 'meta';

  const schemaObjects = hasOnlyMetaSchemas
    ? (schemaObjectsResponse.children?.meta ?? {})
    : schemaObjectsResponse;

  const [userExpandedKeys, setUserExpandedKeys] = useState<string[]>([]);

  const expandTreeNode = useCallback((key: string) => {
    setUserExpandedKeys((prev) => (prev.includes(key) ? prev : [...prev, key]));
  }, []);

  const { tree: treeData, notificationContextHolder } =
    useTransformMetaSchemaToTree({
      schemaObjects,
      setSelectedSchema,
      selectedSchemaPath,
      selectedSchemaVersion,
      expandTreeNode,
      // Meta-only view roots the tree at children.meta, but schema.name / selection
      // still include the meta/ prefix — keep folder path segments aligned.
      rootPathSegments: hasOnlyMetaSchemas
        ? META_ROOT_PATH_SEGMENTS
        : EMPTY_PATH_SEGMENTS,
    });

  const expandedKeys = useMemo(
    () => [...new Set([...userExpandedKeys])],
    [userExpandedKeys],
  );

  // An empty list is only empty once it has loaded. Without this the first
  // paint shows "No schemas found" and its Add Schema button, which is a second
  // one alongside the toolbar's for as long as the fetch is in flight.
  if (isLoading) {
    return (
      <div className={cn('flex justify-center p-4', className)}>
        <Spin size="small" />
      </div>
    );
  }

  if (metaSchemas.length === 0) {
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
    <>
      {notificationContextHolder}
      <div
        className={cn(
          'h-[calc(100vh-175px)] css-custom-scrollbar flex flex-col gap-2 pt-2',
          className,
        )}
      >
        <Tree
          blockNode
          className={cn(
            // Chevron expand alignment center
            '[&_.ant-tree-switcher]:m-auto',
            // Tree node content wrapper for truncated items in tree
            '[&_.ant-tree-node-content-wrapper]:min-w-0!',
          )}
          treeData={treeData}
          expandedKeys={expandedKeys}
          onExpand={(keys) => setUserExpandedKeys(keys as string[])}
        />

        <div ref={loadMoreRef} className="h-4 flex justify-center">
          {isFetchingNextPage && <Spin size="small" />}
        </div>
      </div>
    </>
  );
};
