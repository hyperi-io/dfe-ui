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
}

export const ActionsMenu = ({ children, classNames }: ActionsMenuProps) => {
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
        icon={isMenuOpen ? <IconX /> : <IconMenu2 />}
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        classNames={classNames?.trigger}
      />
      {isMenuOpen && (
        <div
          className={cn(
            // Alignment
            'absolute top-10 right-0 z-2',
            // Card styling
            'w-96 bg-background dark:bg-dark-background border border-foreground/10 dark:border-dark-foreground/10 p-4 rounded-md shadow-md',
            // Layout
            'flex flex-col',
            classNames?.menu,
          )}
        >
          {children}
        </div>
      )}
    </div>
  );
};
