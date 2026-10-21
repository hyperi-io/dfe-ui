'use client';

import { Layout } from 'antd';
import React from 'react';

import { ErrorBoundary } from '@/core/components/ErrorBoundary';
import { useHasAppAccess } from '@/core/components/RbacProtected/hooks/useHasAppAccess';
import { Sidebar } from '@/core/components/SidebarMenu';
import { NoAccessScene } from '@/core/scenes/NoAccessScene';
import { cn } from '@/core/utils/style';
import { usePathname } from 'next/navigation';

interface AppLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export const AppLayout = ({ className, children }: AppLayoutProps) => {
  const { hasAccess } = useHasAppAccess();
  const pathname = usePathname();

  // A user whose roles grant no usable surface meets the branded no-access page
  // instead of an empty shell with a bare sidebar.
  if (!hasAccess) {
    return <NoAccessScene />;
  }

  return (
    <Layout className={cn('min-h-screen', className)}>
      <Sidebar />
      <Layout className="min-w-0 flex-1">
        {/* Keyed by the route so a page crash stays in this column. The
            sidebar remains usable, and leaving the route clears the error. */}
        <ErrorBoundary key={pathname} className="min-h-screen w-full">
          {children}
        </ErrorBoundary>
      </Layout>
    </Layout>
  );
};
