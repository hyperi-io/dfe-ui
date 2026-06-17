import { useSetComponentHeight } from '@/core/hooks/useSetComponentHeight';
import { cn } from '@/core/utils/style';
import { AdminTabLabel } from '@/Settings/components/AdminTabLabel';
import { Tabs } from 'antd';
import { UserGroups } from './UserGroups';

export const GroupManagement = () => {
  const { componentHeight } = useSetComponentHeight({
    offset: 200,
  });
  return (
    <Tabs
      classNames={{
        content: 'css-custom-scrollbar overflow-auto',
      }}
      styles={{
        content: {
          height: componentHeight,
        },
      }}
      className={cn(
        // Disable cursor for tabs
        // Remove this if more tabs are added
        '[&_.ant-tabs-nav-list]:w-full [&_.ant-tabs-tab]:w-full [&_.ant-tabs-tab]:cursor-default [&_.ant-tabs-tab-btn]:cursor-default',
      )}
      items={[
        {
          key: 'user-groups',
          label: (
            <AdminTabLabel
              className={cn('max-w-full')}
              label="User Groups"
              description="Configure custom groups and members."
            />
          ),
          children: <UserGroups />,
        },
      ]}
    />
  );
};
