'use client';

import { Toolbar } from '@/core/components/Toolbar';
import { cn } from '@/core/utils/style';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export const SourcesToolbar = () => {
  const pathname = usePathname();

  const routes = [
    {
      path: '/sources',
      label: 'Sources',
    },
    ...(pathname.includes('/sources/create')
      ? [
          {
            path: '/sources/create',
            label: 'Create Source',
            disabled: true,
          },
        ]
      : []),
  ];

  const isSelected = (path: string) => pathname === path;

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
    </Toolbar>
  );
};
