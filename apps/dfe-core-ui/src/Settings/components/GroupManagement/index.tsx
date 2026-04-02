import { Tabs } from 'antd';
import { AdminTabLabel } from '../AdminTabLabel';
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
            <AdminTabLabel
              className="max-w-full"
              label="User Groups"
              description="Configure custom groups and members."
            />
          ),
          children: <UserGroups />,
        },
        {
          key: 'organisation-groups',
          label: (
            <AdminTabLabel
              className="max-w-full"
              label="Organisation Groups"
              description="Configure custom groups and organisations."
            />
          ),
          children: <OrganisationGroups />,
        },
      ]}
    />
  );
};
