'use client';

import { Layout } from 'antd';
import React from 'react';

import { Sidebar } from '@/core/components/SidebarMenu';
import { cn } from '@/core/utils/style';

interface AppLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export const AppLayout = ({ className, children }: AppLayoutProps) => {
  return (
    <Layout className={cn('min-h-screen', className)}>
      <Sidebar />
      <Layout>{children}</Layout>
    </Layout>
  );
};
