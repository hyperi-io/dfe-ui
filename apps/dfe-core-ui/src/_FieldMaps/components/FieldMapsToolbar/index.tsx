'use client';

import { CreateFieldMapDrawer } from '@/core/components/CreateFieldMapDrawer';
import { Toolbar } from '@/core/components/Toolbar';
import {
  ListFieldMapsProvider,
  useListFieldMapsContext,
} from '@/core/contexts/ListFieldMapsContext';
import { cn } from '@/core/utils/style';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const routes = [
  {
    path: '/field-maps',
    label: 'Field Maps',
    disabled: false,
  },
];

export const FieldMapsToolbarBase = () => {
  const pathname = usePathname();
  const isSelected = (path: string) => pathname === path;

  const { setSelectedFieldMap } = useListFieldMapsContext();

  return (
    <Toolbar>
      <nav className="flex w-full gap-x-6">
        {routes.map((route) => (
          <Link
            className={cn(
              !isSelected(route.path) &&
                'text-foreground! dark:text-dark-foreground! hover:text-tertiary!',
              isSelected(route.path) && 'text-tertiary! font-semibold',
            )}
            key={route.path}
            href={route.path}
            {...(route.disabled
              ? { 'aria-disabled': true, onClick: (e) => e.preventDefault() }
              : {})}
          >
            {route.label}
          </Link>
        ))}
      </nav>
      <CreateFieldMapDrawer
        title="Add Field Map"
        onSuccess={({ standard, source }) => {
          setSelectedFieldMap({
            map_source: source ?? null,
            map_standard: standard,
          });
        }}
      />
    </Toolbar>
  );
};

export const FieldMapsToolbar = () => {
  return (
    <ListFieldMapsProvider>
      <FieldMapsToolbarBase />
    </ListFieldMapsProvider>
  );
};
