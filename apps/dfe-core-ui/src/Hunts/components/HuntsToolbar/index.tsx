'use client';

import { Toolbar } from '@/core/components/Toolbar';
import { cn } from '@/core/utils/style';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const routes = [
  {
    path: '/hunts',
    label: 'Hunts',
  },
];

export const HuntsToolbar = () => {
  const pathname = usePathname();
  const isSelected = (path: string) => pathname === path;

  return (
    <Toolbar>
      <nav className="flex justify-between w-full">
        {routes.map((route) => (
          <Link
            className={cn(
              !isSelected(route.path) &&
                'text-foreground! dark:text-dark-foreground! hover:text-tertiary!',
              isSelected(route.path) && 'text-tertiary! font-semibold',
            )}
            key={route.path}
            href={route.path}
          >
            {route.label}
          </Link>
        ))}
      </nav>
    </Toolbar>
  );
};
