import { cn } from '@/core/utils/style';
import { usePromoteRowsContext } from '@/Sources/components/ViewSourceTabs/contexts/PromoteRows.context';
import { RecursiveRendererActionMenu } from './RecursiveRendererActionMenu';

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  value !== null && typeof value === 'object' && !Array.isArray(value);

export const RecursiveRowRenderer = ({
  row,
  level = 0,
  parentPath = '',
}: {
  row: Record<string, unknown> | undefined;
  level?: number;
  parentPath?: string;
}) => {
  const plainRow = isPlainObject(row) ? row : null;
  const keys = plainRow ? Object.keys(plainRow) : [];

  const { isFieldPromoted } = usePromoteRowsContext();

  if (!plainRow) {
    return null;
  }

  return (
    <div className="flex flex-col gap-2">
      <ul className="flex gap-1 flex-wrap">
        {keys.map((key) => {
          const fieldPath = parentPath ? `${parentPath}.${key}` : key;

          return (
            <li key={key} className="font-mono text-xs flex items-center gap-1">
              <span
                className={cn(
                  // Text
                  'font-medium',
                  // Chip
                  'bg-foreground/10 px-1 py-0.5 rounded-md dark:bg-dark-foreground/20',
                  isFieldPromoted(fieldPath) &&
                    'bg-purple-500/20 dark:bg-purple-500/30',
                  'mb-auto flex items-center',
                )}
              >
                {key}:
                {level > 0 && (
                  <RecursiveRendererActionMenu fieldPath={fieldPath} />
                )}
              </span>
              {isPlainObject(plainRow[key]) ? (
                <RecursiveRowRenderer
                  row={plainRow[key] as Record<string, unknown>}
                  level={level + 1}
                  parentPath={fieldPath}
                />
              ) : (
                JSON.stringify(plainRow[key])
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
};
