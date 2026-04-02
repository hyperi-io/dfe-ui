import { Tabs } from 'antd';
import { OrganisationGroups } from './OrganisationGroups';
import { UserGroups } from './UserGroups';

export const GroupManagement = () => {
  return (
    <Tabs
      className="[&_.ant-tabs-nav-list]:w-full [&_.ant-tabs-tab]:w-full"
      items={[
        {
          key: 'user-groups',
          label: (
            <div className="flex flex-col gap-1 text-left w-full h-full">
              <p className="text-base font-semibold">User Groups</p>
              <span className="text-foreground/50 dark:text-dark-foreground/50 text-xs whitespace-normal">
                Configure custom groups and members.
              </span>
            </div>
          ),
          children: <UserGroups />,
        },
        {
          key: 'organisation-groups',
          label: (
            <div className="flex flex-col gap-1 text-left w-full h-full">
              <p className="text-base font-semibold">Organisation Groups</p>
              <span className="text-foreground/50 dark:text-dark-foreground/50 text-xs whitespace-normal">
                Configure custom groups and organisations.
              </span>
            </div>
          ),
          children: <OrganisationGroups />,
        },
      ]}
    />
  );
};
