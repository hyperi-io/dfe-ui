import { NotificationCard } from '@/core/components/NotificationCard';
import { TCreateSchemaResponse } from '@/core/hooks/useCreateSchema/types';
import { cn } from '@/core/utils/style';
import { TJsonPathsResponse } from '@/Sources/hooks/useFetchJsonPaths/types';
import { Spin } from 'antd';
import { useState } from 'react';
import { CreateSchema } from './CreateSchema';
import { DiscoverPaths } from './DiscoverPaths';

export const DiscoverPromoteStep = ({
  className,
  jsonPaths,
  onSuccess,
  isCreatedSchema,
}: {
  className?: string;
  jsonPaths: {
    data: TJsonPathsResponse | undefined;
    isLoading: boolean;
    error: Error | null;
  };
  onSuccess?: (schema: TCreateSchemaResponse) => void;
  isCreatedSchema: boolean;
}) => {
  const [isCreatingSchema, setIsCreatingSchema] = useState(false);

  if (jsonPaths.isLoading) {
    return (
      <>
        <Spin /> <p className="sr-only">Loading JSON paths</p>
      </>
    );
  }

  if (jsonPaths.error) {
    return (
      <NotificationCard description={jsonPaths.error?.message} type="error" />
    );
  }

  return (
    <div className={className}>
      {!isCreatingSchema && (
        <DiscoverPaths
          jsonPaths={jsonPaths}
          isCreatedSchema={isCreatedSchema}
          onClick={{
            createSchema: () => setIsCreatingSchema(true),
          }}
        />
      )}

      <CreateSchema
        jsonPaths={jsonPaths}
        onSuccess={onSuccess}
        className={cn(isCreatingSchema ? '' : 'hidden')}
      />
    </div>
  );
};
