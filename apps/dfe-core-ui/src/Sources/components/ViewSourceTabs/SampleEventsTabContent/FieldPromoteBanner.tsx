import { NotificationCard } from '@/core/components/NotificationCard';
import { cn } from '@/core/utils/style';
import { usePromoteRowsContext } from '@/Sources/components/ViewSourceTabs/contexts/PromoteRows.context';
import { IconMinus } from '@repo/dfe-icons';
import { DiscoverJsonPathsDrawer } from './DiscoverJsonPathsDrawer';

export const FieldPromoteBanner = ({
  selectedSourceName,
  selectedSourceVersion,
}: {
  selectedSourceName: string;
  selectedSourceVersion: string;
}) => {
  const { fieldsToPromote, handleRemovePromoteField } = usePromoteRowsContext();

  return (
    <NotificationCard
      type="action"
      title="Fields for Promote"
      description={
        <div className="flex flex-col gap-y-2">
          <p>The following fields will be promoted in the source schema:</p>
          <ul className="flex gap-1 flex-wrap">
            {Array.from(fieldsToPromote).map((field) => (
              <li
                key={field}
                className={cn(
                  // Chip
                  'font-mono bg-purple-500/10 dark:bg-purple-500/20 px-1 py-0.5 rounded-md text-xs',
                  // Layout
                  'flex items-center gap-1',
                )}
              >
                {field}
                <button
                  type="button"
                  className="p-0.5 rounded-full border border-purple-500/30 hover:bg-purple-500/20"
                  aria-label="Remove field from promoted fields"
                  onClick={() => handleRemovePromoteField(field)}
                >
                  <IconMinus />
                </button>
              </li>
            ))}
          </ul>
        </div>
      }
      action={
        <DiscoverJsonPathsDrawer
          selectedSourceName={selectedSourceName}
          selectedSourceVersion={selectedSourceVersion}
          fieldsToPromote={fieldsToPromote}
        />
      }
    />
  );
};
