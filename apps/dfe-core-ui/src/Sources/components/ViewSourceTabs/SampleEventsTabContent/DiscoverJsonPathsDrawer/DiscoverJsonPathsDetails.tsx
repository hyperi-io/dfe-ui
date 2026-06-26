import { AddSchemaTable } from '@/core/components/CreateSchemaForm/AddSchemaTable';
import { Form } from '@/core/components/Form';
import { NotificationCard } from '@/core/components/NotificationCard';
import { useAntdZodResolver } from '@/core/utils/zod/useAntdZodResolver';
import { useFetchJsonPaths } from '@/Sources/hooks/useFetchJsonPaths';
import { Spin } from 'antd';
import { useMemo } from 'react';
import z from 'zod';

const rowSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.string(),
  attribute: z.array(z.string()),
  use_case: z.string(),
  expr: z.string(),
  comment: z.string(),
});

export const DiscoverJsonPathsDetails = ({
  selectedSourceName,
  selectedSourceVersion,
  fieldsToPromote,
}: {
  selectedSourceName: string;
  selectedSourceVersion: string;
  fieldsToPromote: string[];
}) => {
  const {
    data: jsonPaths,
    isLoading: isLoadingJsonPaths,
    error: errorJsonPaths,
  } = useFetchJsonPaths({
    source_name: selectedSourceName,
    version: selectedSourceVersion,
    paths: fieldsToPromote.join(','),
  });

  const formValidation = useAntdZodResolver(rowSchema);

  const tableValues = useMemo(
    () =>
      jsonPaths?.paths.map((path) => ({
        id: path.path,
        ...path.column,
        additionalInfo: { ...path, column: undefined },
      })) ?? [],
    [jsonPaths],
  );

  if (isLoadingJsonPaths) {
    return (
      <>
        <Spin /> <p className="sr-only">Loading JSON paths</p>
      </>
    );
  }

  if (errorJsonPaths) {
    return (
      <NotificationCard description={errorJsonPaths.message} type="error" />
    );
  }

  return (
    <Form className="flex flex-col gap-y-2">
      <AddSchemaTable
        formValidation={formValidation}
        name="jsonPaths"
        initialValues={tableValues}
        title={() => <>Promoted Field Columns</>}
        config={{
          defaultEditFields: false,
          defaultAddColumns: false,
          defaultRemoveColumns: true,
        }}
      />
      {/* <pre>{JSON.stringify(jsonPaths, null, 2)}</pre> */}
    </Form>
  );
};
