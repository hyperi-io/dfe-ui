'use client';

import { ButtonLinkSavedSearch } from '@/core/components/ButtonLinkSavedSearch';
import { CreateCustomRuleDrawer as CreateCustomRuleDrawerV1 } from '@/core/components/CreateCustomRuleDrawer';
import { FeatureFlag } from '@/core/components/FeatureFlag';
import { Toolbar } from '@/core/components/Toolbar';
import { ListRulesProvider as ListRulesProviderV1 } from '@/core/contexts/ListRulesContext';
import { ListRulesProvider } from '@/core/contexts/ListRulesContextV2';
import { cn } from '@/core/utils/style';
import { CreateCustomRuleDrawer } from '@/RulesV2/components/CreateCustomRuleDrawerV2';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

/** The create drawer of the rules list the flag shows, so a new rule lands in that list. */
const CreateRuleButton = () => (
  <FeatureFlag feature="rules_v2">
    <FeatureFlag.On>
      <ListRulesProvider defaultFilters={{}}>
        <CreateCustomRuleDrawer button={{ type: 'default' }} />
      </ListRulesProvider>
    </FeatureFlag.On>
    <FeatureFlag.Off>
      <ListRulesProviderV1 defaultFilters={{}}>
        <CreateCustomRuleDrawerV1 button={{ type: 'default' }} />
      </ListRulesProviderV1>
    </FeatureFlag.Off>
  </FeatureFlag>
);

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
        <CreateRuleButton />
        <ButtonLinkSavedSearch />
      </div>
    </Toolbar>
  );
};
