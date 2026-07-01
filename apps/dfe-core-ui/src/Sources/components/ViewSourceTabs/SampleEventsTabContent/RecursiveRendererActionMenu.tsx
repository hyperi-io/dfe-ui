import { cn } from '@/core/utils/style';
import { usePromoteRowsContext } from '@/Sources/components/ViewSourceTabs/contexts/PromoteRows.context';
import { IconDots, IconMinus, IconPlus } from '@repo/dfe-icons';
import { Button, Popover } from 'antd';
import { useState } from 'react';

export const RecursiveRendererActionMenu = ({
  fieldPath,
}: {
  fieldPath: string;
}) => {
  const [popoverOpen, setPopoverOpen] = useState(false);

  const { handleAddPromoteField, handleRemovePromoteField, isFieldPromoted } =
    usePromoteRowsContext();
  const isPromoted = isFieldPromoted(fieldPath);

  return (
    <Popover
      destroyOnHidden
      trigger="click"
      open={popoverOpen}
      onOpenChange={setPopoverOpen}
      content={
        <div className="flex flex-col gap-y-1">
          <Button
            className="w-full justify-start"
            icon={<IconPlus />}
            onClick={() => {
              handleAddPromoteField(fieldPath);
              setPopoverOpen(false);
            }}
            type="text"
            size="small"
            disabled={isPromoted}
          >
            Promote Field
          </Button>
          <Button
            className="w-full justify-start"
            icon={<IconMinus />}
            onClick={() => {
              handleRemovePromoteField(fieldPath);
              setPopoverOpen(false);
            }}
            type="text"
            size="small"
            disabled={!isPromoted}
          >
            Un-promote Field
          </Button>
        </div>
      }
    >
      <button
        aria-label={`Actions for ${fieldPath}`}
        className={cn(
          // Spacing
          'ml-2',
          // Chip
          'bg-background dark:bg-dark-background rounded-full p-0.5',
        )}
        type="button"
      >
        <IconDots className="w-3 h-3" />
      </button>
    </Popover>
  );
};
