'use client';

import { IconWrapper } from '@/core/components/IconWrapper';
import {
  IconLayoutSidebarLeftCollapse as MenuFoldOutlined,
  IconLayoutSidebarRightCollapse as MenuUnfoldOutlined,
} from '@hyperi/icons';
import { Button, Layout } from 'antd';
import { useState } from 'react';

import { ThemeToggle } from '@/core/components/ThemeToggle';
import { UserActionsButton } from '@/core/components/UserActionsButton';
import { useTheme } from '@/core/contexts/ThemeContext';
import { cn } from '@/core/utils/style';
import { CompatibleStyleWrapper } from '../../contexts/ClientContext/CompatibleStyleWrapper';
import { Logo } from './Logo';
import { SidebarMenu } from './SidebarMenu';

const { Sider } = Layout;

export const BaseSidebar = () => {
  const { colorMode } = useTheme();
  const [collapsed, setCollapsed] = useState(false);
  return (
    <Sider
      className="h-screen border-r border-solid border-gray-200 dark:border-[#303030]"
      theme={colorMode === 'light' ? 'light' : 'dark'}
      trigger={null}
      collapsible
      collapsed={collapsed}
      width={250}
    >
      <div className="flex flex-col h-full justify-between">
        <div className="relative">
          <Logo collapsed={collapsed} colorMode={colorMode} />
          <Button
            shape="circle"
            type="text"
            size="small"
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            classNames={{
              root: cn(
                'focus:outline-2 focus:outline-tertiary focus:rounded-full',
                'absolute top-5 -right-3',
                'bg-background dark:bg-dark-background hover:bg-gray-200 dark:hover:bg-gray-800 border border-solid border-gray-300 dark:border-gray-700',
                'dark:text-dark-foreground! text-foreground!',
              ),
              icon: cn('text-xs h-full'),
            }}
            icon={
              collapsed ? (
                <IconWrapper icon={<MenuUnfoldOutlined />} />
              ) : (
                <IconWrapper icon={<MenuFoldOutlined />} />
              )
            }
            onClick={() => setCollapsed(!collapsed)}
          />
          <SidebarMenu collapsed={collapsed} />
        </div>

        <div className="flex gap-x-1 gap-y-2 flex-wrap px-7 content-end mb-4 w-full items-center">
          {!collapsed && (
            <p className="text-sm text-gray-400 dark:text-gray-500 mr-auto">
              v1.0.0
            </p>
          )}
          <ThemeToggle className="mr-2" collapsed={collapsed} />
          <UserActionsButton collapsed={collapsed} />
        </div>
      </div>
    </Sider>
  );
};

export const Sidebar = () => {
  return (
    <CompatibleStyleWrapper>
      <BaseSidebar />
    </CompatibleStyleWrapper>
  );
};
