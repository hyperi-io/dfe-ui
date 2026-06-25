'use client';

import { Toolbar } from '@/core/components/Toolbar';
import { cn } from '@/core/utils/style';
import { CreateHuntDrawer } from '@/Hunts/components/CreateHuntDrawer';
import { ListHuntsProvider } from '@/Hunts/contexts/ListHuntsContext';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export const HuntsToolbar = () => {
  const pathname = usePathname();

  const routes = [
    {
      path: '/hunts',
      label: 'Hunts',
      disabled: false,
    },
  ];

  const isSelected = (path: string) => pathname === path;

  return (
    <ListHuntsProvider>
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

        <CreateHuntDrawer />
      </Toolbar>
    </ListHuntsProvider>
  );
};
