'use client';

import { Toolbar } from '@/core/components/Toolbar';
import { cn } from '@/core/utils/style';
import { SeedServiceConfigs } from '@/Services/components/serviceConfigs/SeedServiceConfigs';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const routes = [
  {
    path: '/services/configurations',
    label: 'Service Configurations',
    disabled: false,
  },
  {
    path: '/services/deployments',
    label: 'Deployments',
    disabled: false,
  },
];

export const ServicesToolbar = () => {
  const pathname = usePathname();

  const isSelected = (path: string) => pathname === path;

  const isServiceConfigPage = pathname === '/services/configurations';

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
      {isServiceConfigPage && <SeedServiceConfigs />}
    </Toolbar>
  );
};
