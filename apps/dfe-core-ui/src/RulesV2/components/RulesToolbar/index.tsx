'use client';

import { ButtonLinkSavedSearch } from '@/core/components/ButtonLinkSavedSearch';
import { CreateCustomRuleDrawer } from '@/core/components/CreateCustomRuleDrawer';
import { Toolbar } from '@/core/components/Toolbar';
import { ListRulesProvider } from '@/core/contexts/ListRulesContext';
import { cn } from '@/core/utils/style';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export const RulesToolbar = () => {
  const pathname = usePathname();

  const routes = [
    {
      path: '/rules',
      label: 'Rules',
    },
    ...(pathname.includes('/rules/create')
      ? [
          {
            path: '/rules/create',
            label: 'Create Rule',
            disabled: true,
          },
        ]
      : []),
  ];

  const isSelected = (path: string) => pathname === path;

  return (
    <ListRulesProvider defaultFilters={{}}>
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

        <div className="flex gap-x-2">
          <CreateCustomRuleDrawer button={{ type: 'default' }} />
          <ButtonLinkSavedSearch />
        </div>
      </Toolbar>
    </ListRulesProvider>
  );
};
