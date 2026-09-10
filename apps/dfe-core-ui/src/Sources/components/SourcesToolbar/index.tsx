'use client';

import { Toolbar } from '@/core/components/Toolbar';
import { cn } from '@/core/utils/style';
import { AddFromCatalogueDrawer } from '@/Sources/components/AddFromCatalogueDrawer';
import { CreateSourceDrawer } from '@/Sources/components/CreateSourceDrawer';
import { ListSourcesProvider } from '@/Sources/contexts/ListSourcesContext';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export const SourcesToolbar = () => {
  const pathname = usePathname();
  const routes = [
    {
      path: '/sources',
      label: 'Sources',
      disabled: false,
    },
  ];

  const isSelected = (path: string) => pathname === path;

  return (
    <ListSourcesProvider defaultFilters={{}}>
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

        <div className="flex gap-2">
          <AddFromCatalogueDrawer />
          <CreateSourceDrawer />
        </div>
      </Toolbar>
    </ListSourcesProvider>
  );
};
