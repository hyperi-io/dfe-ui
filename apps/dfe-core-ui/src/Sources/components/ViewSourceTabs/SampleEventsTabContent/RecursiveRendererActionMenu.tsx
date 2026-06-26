import { cn } from '@/core/utils/style';
import { usePromoteRowsContext } from '@/Sources/components/ViewSourceTabs/contexts/PromoteRows.context';
import { IconDots, IconMinus, IconPlus } from '@repo/dfe-icons';
import { Button } from 'antd';
import { useEffect, useRef, useState } from 'react';

export const RecursiveRendererActionMenu = ({
  fieldPath,
}: {
  fieldPath: string;
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { handleAddPromoteField, handleRemovePromoteField, isFieldPromoted } =
    usePromoteRowsContext();
  const isPromoted = isFieldPromoted(fieldPath);

  useEffect(() => {
    if (!isMenuOpen) {
      return;
    }

    const handlePointerDown = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, [isMenuOpen]);

  return (
    <div className="relative" ref={menuRef}>
      <button
        aria-label={`Actions for ${fieldPath}`}
        className={cn(
          // Spacing
          'ml-2',
          // Chip
          'bg-background dark:bg-dark-background rounded-full p-0.5',
        )}
        type="button"
        onClick={() => setIsMenuOpen(!isMenuOpen)}
      >
        <IconDots className="w-3 h-3" />
      </button>
      {isMenuOpen && (
        <div
          className={cn(
            'absolute top-0 right-0 translate-x-full -translate-y-full',
          )}
        >
          <div className="bg-background dark:bg-dark-background rounded-md p-2">
            <Button
              type="text"
              size="small"
              icon={<IconPlus />}
              aria-label="Promote Field"
              className="w-full justify-start"
              disabled={isPromoted}
              onClick={() => {
                handleAddPromoteField(fieldPath);
                setIsMenuOpen(false);
              }}
            >
              Promote Field
            </Button>
            <Button
              type="text"
              size="small"
              icon={<IconMinus />}
              aria-label="Demote Field"
              className="w-full justify-start"
              disabled={!isPromoted}
              onClick={() => {
                handleRemovePromoteField(fieldPath);
                setIsMenuOpen(false);
              }}
              title="Removing promoted fields is not supported yet"
            >
              Remove from Promoted Fields
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
