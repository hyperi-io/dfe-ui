'use client';

import { Toolbar } from '@/core/components/Toolbar';
import { ListFieldMapsProvider } from '@/core/contexts/ListFieldMapsContext';

export const UserAccountToolbar = ({ name }: { name: string }) => {
  return (
    <ListFieldMapsProvider>
      <Toolbar>
        <nav className="flex w-full gap-x-6">Welcome, {name}!</nav>
      </Toolbar>
    </ListFieldMapsProvider>
  );
};
