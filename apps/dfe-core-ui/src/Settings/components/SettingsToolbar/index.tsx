'use client';

import { Toolbar } from '@/core/components/Toolbar';
import { ListFieldMapsProvider } from '@/core/contexts/ListFieldMapsContext';
import { cn } from '@/core/utils/style';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export const SettingsToolbarBase = () => {
  const pathname = usePathname();
  const routes = [
    {
      path: '/settings/admin',
      label: 'Admin Controls',
      disabled: false,
    },
  ];

  const isSelected = (path: string) => pathname === path;

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
