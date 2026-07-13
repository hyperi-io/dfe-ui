'use client';

import { CreateSchemaDrawer } from '@/core/components/CreateSchemaDrawer';
import { Toolbar } from '@/core/components/Toolbar';
import {
  ListSchemasProvider,
  useListSchemasContext,
} from '@/core/contexts/ListSchemasContext';
import { TCreateSchemaResponse } from '@/core/hooks/useCreateSchema/types';
import { cn } from '@/core/utils/style';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const SCHEMA_TYPES_BY_PATH: Record<string, string[]> = {
  '/schemas/meta-schemas': ['meta'],
  '/schemas/other-schemas': ['common-header', 'hunts'],
};

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

export const SchemasToolbarBase = () => {
  const pathname = usePathname();
  const isSelected = (path: string) => pathname === path;

  const { setSelectedSchema } = useListSchemasContext();

  const handleSuccess = (response: TCreateSchemaResponse) => {
    setSelectedSchema({
      schema_path: response.path ?? '',
      schema_version: response.current,
    });
  };
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
      <CreateSchemaDrawer onSuccess={handleSuccess} />
    </Toolbar>
  );
};

export const SchemasToolbar = () => {
  const pathname = usePathname();
  const schemaTypes = SCHEMA_TYPES_BY_PATH[pathname] ?? [];
  return (
    <ListSchemasProvider schemaTypes={schemaTypes}>
      <SchemasToolbarBase />
    </ListSchemasProvider>
  );
};
