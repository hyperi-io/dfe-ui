'use client';

import { Layout } from 'antd';
import React from 'react';

import { useHasAppAccess } from '@/core/components/RbacProtected/hooks/useHasAppAccess';
import { Sidebar } from '@/core/components/SidebarMenu';
import { VersionFooter } from '@/core/components/VersionFooter';
import { NoAccessScene } from '@/core/scenes/NoAccessScene';
import { cn } from '@/core/utils/style';

interface AppLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export const AppLayout = ({ className, children }: AppLayoutProps) => {
  const { hasAccess } = useHasAppAccess();

  // A user whose roles grant no usable surface meets the branded no-access page
  // instead of an empty shell with a bare sidebar.
  if (!hasAccess) {
    return <NoAccessScene />;
  }

  return (
    <Layout className={cn('min-h-screen', className)}>
      <Sidebar />
      <Layout>{children}</Layout>
      <VersionFooter />
    </Layout>
  );
};
