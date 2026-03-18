'use client';

import { Toolbar } from '@/core/components/Toolbar';
import { cn } from '@/core/utils/style';
import {
  ListFieldMapsProvider,
  useListFieldMapsContext,
} from '@/Settings/contexts/ListFieldMapsContext';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CreateFieldMapDrawer } from '../CreateFieldMapDrawer';

export const SettingsToolbarBase = () => {
  const pathname = usePathname();
  const routes = [
    {
      path: '/settings/field-maps',
      label: 'Field Maps',
      disabled: false,
    },
  ];

  const isSelected = (path: string) => pathname === path;
  const { setSelectedFieldMap } = useListFieldMapsContext();

  return (
    <ListFieldMapsProvider>
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

        {pathname === '/settings/field-maps' && (
          <CreateFieldMapDrawer
            onSuccess={({ standard, source }) => {
              setSelectedFieldMap({
                map_source: source ?? null,
                map_standard: standard,
              });
            }}
          />
        )}
      </Toolbar>
    </ListFieldMapsProvider>
  );
};

export const SettingsToolbar = () => {
  return (
    <ListFieldMapsProvider>
      <SettingsToolbarBase />
    </ListFieldMapsProvider>
  );
};
