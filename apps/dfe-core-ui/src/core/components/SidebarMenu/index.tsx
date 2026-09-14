'use client';

import { IconWrapper } from '@/core/components/IconWrapper';
import {
  IconLayoutSidebarLeftCollapse as MenuFoldOutlined,
  IconLayoutSidebarRightCollapse as MenuUnfoldOutlined,
} from '@repo/dfe-icons';
import { Button, Layout } from 'antd';
import { useState } from 'react';

import { ThemeToggle } from '@/core/components/ThemeToggle';
import { UserActionsButton } from '@/core/components/UserActionsButton';
import { useTheme } from '@/core/contexts/ClientContext/ThemeContext';
import { cn } from '@/core/utils/style';
import { Logo } from './Logo';
import { SidebarMenu } from './SidebarMenu';
import { SuiteVersion } from './SuiteVersion';

const { Sider } = Layout;

export const Sidebar = () => {
  const { colorMode } = useTheme();
  const [collapsed, setCollapsed] = useState(false);
  return (
    <Sider
      className="h-screen border-r border-solid border-gray-200 dark:border-dark-background-secondary"
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
          <SidebarMenu
            className="h-full max-h-[calc(100vh-130px)] css-custom-scrollbar"
            collapsed={collapsed}
          />
        </div>

        <div className="absolute bottom-0 left-0 right-0 flex gap-x-1 gap-y-2 flex-wrap px-7 content-end py-4 w-full items-center justify-end bg-background dark:bg-dark-background">
          {!collapsed && <SuiteVersion className="mr-auto" />}
          <ThemeToggle className="mr-2" collapsed={collapsed} />
          <UserActionsButton />
        </div>
      </div>
    </Sider>
  );
};
