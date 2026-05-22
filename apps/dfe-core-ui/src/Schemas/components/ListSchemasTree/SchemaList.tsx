import { cn } from '@/core/utils/style';
import { EmptyList } from '@/Schemas/components/ListSchemasTree/EmptyList';
import { ErrorList } from '@/Schemas/components/ListSchemasTree/ErrorList';
import { useListSchemasContext } from '@/Schemas/contexts/ListSchemasContext';
import { Spin, Tree } from 'antd';
import { useTransformSchemaToTree } from './hooks/useTransformSchemaToTree';

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

  const treeData = useTransformSchemaToTree({
    schemaObjects,
    setSelectedSchema,
    selectedSchemaPath,
    selectedSchemaVersion,
  });

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
      <Tree blockNode treeData={treeData} />
      <div ref={loadMoreRef} className="h-4 flex justify-center">
        {isFetchingNextPage && <Spin size="small" />}
      </div>
    </div>
  );
};
