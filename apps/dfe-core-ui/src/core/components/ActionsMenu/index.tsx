import { IconMenu2, IconX } from '@repo/dfe-icons';
import { Button } from 'antd';
import { useEffect, useRef, useState } from 'react';

export const ActionsMenu = ({ children }: { children: React.ReactNode }) => {
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
    <div className="ml-auto relative" ref={menuRef}>
      <Button
        type="default"
        icon={isMenuOpen ? <IconX /> : <IconMenu2 />}
        onClick={() => setIsMenuOpen(!isMenuOpen)}
      />
      {isMenuOpen && (
        <div className="absolute top-10 right-0 bg-background dark:bg-dark-background border border-foreground/10 dark:border-dark-foreground/10 p-4 rounded-md shadow-md z-2 w-96">
          {children}
        </div>
      )}
    </div>
  );
};
