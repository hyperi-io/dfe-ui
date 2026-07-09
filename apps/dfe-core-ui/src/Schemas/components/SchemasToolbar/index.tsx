'use client';

import { CreateSchemaDrawer } from '@/core/components/CreateSchemaDrawer';
import { Toolbar } from '@/core/components/Toolbar';
import { ListSchemasProvider } from '@/core/contexts/ListSchemasContext';
import { cn } from '@/core/utils/style';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export const SchemasToolbar = () => {
  const pathname = usePathname();
  const routes = [
    {
      path: '/schemas/meta-schemas',
      label: 'Meta Schemas',
      disabled: false,
    },
    {
      path: '/schemas/other-schemas',
      label: 'Other Schemas',
      disabled: false,
    },
  ];

  const isSelected = (path: string) => pathname === path;

  return (
    <ListSchemasProvider defaultFilters={{}}>
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
        <CreateSchemaDrawer />
      </Toolbar>
    </ListSchemasProvider>
  );
};
