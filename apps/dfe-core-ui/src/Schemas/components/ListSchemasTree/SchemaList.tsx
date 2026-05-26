import { cn } from '@/core/utils/style';
import { EmptyList } from '@/Schemas/components/ListSchemasTree/EmptyList';
import { ErrorList } from '@/Schemas/components/ListSchemasTree/ErrorList';
import { useListSchemasContext } from '@/Schemas/contexts/ListSchemasContext';
import { Spin, Tree } from 'antd';
import { useMemo, useState } from 'react';
import {
  getExpandedKeysForSchemaSelection,
  useTransformSchemaToTree,
} from './hooks/useTransformSchemaToTree';

export const SchemaList = ({ className }: { className?: string }) => {
  const {
    data: { items: schemas, schema_objects: schemaObjects },
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

  const { tree: treeData, notificationContextHolder } =
    useTransformSchemaToTree({
      schemaObjects,
      setSelectedSchema,
      selectedSchemaPath,
      selectedSchemaVersion,
    });

  const expandedKeysForSelection = useMemo(
    () =>
      getExpandedKeysForSchemaSelection(
        selectedSchemaPath,
        selectedSchemaVersion,
      ),
    [selectedSchemaPath, selectedSchemaVersion],
  );

  const [userExpandedKeys, setUserExpandedKeys] = useState<string[]>([]);

  const expandedKeys = useMemo(
    () => [...new Set([...userExpandedKeys, ...expandedKeysForSelection])],
    [userExpandedKeys, expandedKeysForSelection],
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
          className="[&_.ant-tree-node-content-wrapper]:min-w-0! [&_.ant-tree-node-content-wrapper]:overflow-visible [&_.ant-tree-title]:max-w-full [&_.ant-tree-title]:min-w-0! [&_.ant-tree-title]:overflow-visible"
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
