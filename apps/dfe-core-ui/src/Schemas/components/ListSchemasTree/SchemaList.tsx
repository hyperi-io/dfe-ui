import { useListSchemasContext } from '@/core/contexts/ListSchemasContext';
import { cn } from '@/core/utils/style';
import { EmptyList } from '@/Schemas/components/ListSchemasTree/EmptyList';
import { ErrorList } from '@/Schemas/components/ListSchemasTree/ErrorList';
import { Spin, Tree } from 'antd';
import { useCallback, useMemo, useState } from 'react';
import {
  getExpandedKeysForSchemaSelection,
  useTransformSchemaToTree,
} from './hooks/useTransformSchemaToTree';

export const SchemaList = ({ className }: { className?: string }) => {
  const {
    data: { items: metaSchemas, schema_objects: schemaObjects },
    error,
    loadMoreRef,
    isFetchingNextPage,
    setSelectedSchema,
    selectedSchemaPath,
    selectedSchemaVersion,
    filters,
    hasFilters,
    setFilters,
  } = useListSchemasContext();

  const metaSchemaObjects = schemaObjects.children?.meta ?? {};

  const [userExpandedKeys, setUserExpandedKeys] = useState<string[]>([]);

  const expandTreeNode = useCallback((key: string) => {
    setUserExpandedKeys((prev) => (prev.includes(key) ? prev : [...prev, key]));
  }, []);

  const { tree: treeData, notificationContextHolder } =
    useTransformSchemaToTree({
      schemaObjects: metaSchemaObjects,
      setSelectedSchema,
      selectedSchemaPath,
      selectedSchemaVersion,
      expandTreeNode,
    });

  const expandedKeysForSelection = useMemo(
    () =>
      getExpandedKeysForSchemaSelection(
        selectedSchemaPath,
        selectedSchemaVersion,
      ),
    [selectedSchemaPath, selectedSchemaVersion],
  );

  const expandedKeys = useMemo(
    () => [...new Set([...userExpandedKeys, ...expandedKeysForSelection])],
    [userExpandedKeys, expandedKeysForSelection],
  );

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
