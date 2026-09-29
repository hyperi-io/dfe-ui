import { JsonView, type JsonViewNode } from '@/core/components/JsonView';
import { usePromoteRowsContext } from '@/Sources/components/ViewSourceTabs/contexts/PromoteRows.context';
import { useSourceDetailsContext } from '@/Sources/contexts/SourceDetailsContext';
import { TSampleRowsResponse } from '@/Sources/hooks/useFetchSampleRows/types';
import { Card } from 'antd';
import { RecursiveRendererActionMenu } from './RecursiveRendererActionMenu';

// Row keys and the column's own top level open; anything deeper is one click away.
const INITIAL_DEPTH = 2;

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  value !== null && typeof value === 'object' && !Array.isArray(value);

const fieldPathOf = ({ path }: JsonViewNode): string | null =>
  path.every((segment) => typeof segment === 'string') ? path.join('.') : null;

// A promotable field sits inside a column and is a value or an array, never an
// object or an array element: the engine promotes JSON paths, not positions.
const promotableFieldPath = (node: JsonViewNode): string | null => {
  const fieldPath = fieldPathOf(node);
  if (fieldPath === null || node.path.length < 2 || isPlainObject(node.value)) {
    return null;
  }
  return fieldPath;
};

export const SampleRowsCard = ({
  row,
}: {
  row: TSampleRowsResponse['rows'][number];
}) => {
  const { canPromoteFields } = useSourceDetailsContext();
  const { isFieldPromoted, promotedOnSchemaFieldsSet } =
    usePromoteRowsContext();

  const keyClassName = (node: JsonViewNode) => {
    const fieldPath = fieldPathOf(node);
    if (fieldPath === null) return undefined;
    if (promotedOnSchemaFieldsSet.has(fieldPath)) {
      return 'bg-tertiary/20 dark:bg-tertiary/30';
    }
    if (isFieldPromoted(fieldPath)) {
      return 'bg-purple-500/20 dark:bg-purple-500/30';
    }
    return undefined;
  };

  const renderActions = (node: JsonViewNode) => {
    const fieldPath = promotableFieldPath(node);
    return fieldPath === null ? null : (
      <RecursiveRendererActionMenu fieldPath={fieldPath} />
    );
  };

  return (
    <Card size="small">
      <JsonView
        data={row}
        initialDepth={INITIAL_DEPTH}
        className="text-xs"
        keyClassName={canPromoteFields ? keyClassName : undefined}
        renderActions={canPromoteFields ? renderActions : undefined}
      />
    </Card>
  );
};
