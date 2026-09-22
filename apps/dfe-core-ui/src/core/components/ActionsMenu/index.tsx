import { cn } from '@/core/utils/style';
import { IconMenu2, IconX } from '@repo/dfe-icons';
import { Button } from 'antd';
import { useEffect, useRef, useState } from 'react';

interface ActionsMenuProps {
  children: React.ReactNode;
  classNames?: {
    container?: string;
    trigger?: string;
    menu?: string;
  };
  placement?: 'bottom-right' | 'left';
  destroyOnHidden?: boolean;
}

const getPlacementStyles = (placement: ActionsMenuProps['placement']) => {
  switch (placement) {
    case 'left':
      return 'top-0 translate-x-[-102%]';
    case 'bottom-right':
      return 'top-10 right-0';
  }
};

/**
 *
 * @param children - The children to render in the menu.
 * @param classNames - The class names to apply to the menu.
 * @param placement - The placement of the menu.
 * @param destroyOnHidden - Whether to destroy the menu when it is hidden. Caveat: If you are using a modal or drawer to open the menu, you should set this to true.
 * @returns A button that opens the menu when clicked.
 */

export const ActionsMenu = ({
  children,
  classNames,
  placement = 'bottom-right',
  destroyOnHidden = false,
}: ActionsMenuProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isMenuOpen) {
      return;
    }

    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (menuRef.current?.contains(target)) {
        return;
      }
      setIsMenuOpen(false);
    };

    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, [isMenuOpen]);

  return (
    <div
      className={cn('ml-auto relative', classNames?.container)}
      ref={menuRef}
    >
      <Button
        type="default"
        // Icon-only, so the name has to be given: without it the menu holding
        // Edit, Clone and Delete announces as "button" and has no locator.
        aria-label={isMenuOpen ? 'Close actions' : 'Actions'}
        aria-expanded={isMenuOpen}
        icon={isMenuOpen ? <IconX /> : <IconMenu2 />}
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        className={classNames?.trigger}
      />
      {(isMenuOpen || !destroyOnHidden) && (
        <div
          className={cn(
            // Alignment
            'absolute z-100',
            getPlacementStyles(placement),
            // Card styling
            'w-96 bg-background dark:bg-dark-background border border-foreground/10 dark:border-dark-foreground/10 p-4 rounded-md shadow-md',
            // Layout
            'flex flex-col',
            !isMenuOpen && !destroyOnHidden && 'hidden',
            classNames?.menu,
          )}
        >
          {children}
        </div>
      )}
    </div>
  );
};
