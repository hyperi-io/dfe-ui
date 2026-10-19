import { NotificationCard } from '@/core/components/NotificationCard';
import { cn } from '@/core/utils/style';
import { usePromoteRowsContext } from '@/Sources/components/ViewSourceTabs/contexts/PromoteRows.context';
import { DiscoverJsonPathsDrawer } from '@/Sources/components/ViewSourceTabs/SampleEventsTabContent/DiscoverJsonPathsDrawer';
import { IconMinus } from '@repo/dfe-icons';

export const FieldPromoteBanner = ({
  classNames,
}: {
  classNames?: {
    root?: string;
  };
}) => {
  const { fieldsToPromote, handleRemovePromoteField } = usePromoteRowsContext();

  return (
    <NotificationCard
      type="action"
      title="The following fields will be added to the source schema"
      classNames={classNames}
      description={
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
      }
      action={<DiscoverJsonPathsDrawer />}
    />
  );
};
