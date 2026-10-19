'use client';

import { Toolbar } from '@/core/components/Toolbar';
import { ListFieldMapsProvider } from '@/core/contexts/ListFieldMapsContext';

export const UserAccountToolbar = ({ name }: { name: string }) => {
  return (
    <ListFieldMapsProvider>
      <Toolbar>
        <nav className="flex w-full items-center">
          Welcome, <span className="font-medium ml-1">{name}</span>!
        </nav>
      </Toolbar>
    </ListFieldMapsProvider>
  );
};
