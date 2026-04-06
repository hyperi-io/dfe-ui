import { useSetComponentHeight } from '@/core/hooks/useSetComponentHeight';
import { User, USER_DATA } from '@/Settings/mocks/user.data';
import { Input, Table, Tag, Tooltip } from 'antd';
import { useState } from 'react';
import { SectionCard } from '../SectionCard';
import { InviteUserDrawer } from './InviteUserDrawer';
import { LinkUserDrawer } from './LinkUserDrawer';
import { RowActions } from './RowActions';

const USER_DATA_COLUMNS = [
  {
    title: 'Name',
    dataIndex: 'name',
    key: 'name',
  },
  {
    dataIndex: 'email',
    key: 'email',
    title: 'Email',
    width: 250,
  },
  {
    title: 'Roles',
    dataIndex: 'roles',
    key: 'roles',
    render: (roles: string[]) =>
      roles?.length ? (
        <Tooltip destroyOnHidden title={roles.join(', ')}>
          <Tag>
            {roles?.length} Role{roles?.length > 1 ? 's' : ''}
          </Tag>
        </Tooltip>
      ) : (
        <></>
      ),
  },
  {
    title: 'Organisations',
    dataIndex: 'organisations',
    key: 'organisations',
    width: 130,
    render: (organisations: string[]) =>
      organisations?.length ? (
        <Tooltip destroyOnHidden title={organisations.join(', ')}>
          <Tag>
            {organisations?.length} Organisation
            {organisations?.length > 1 ? 's' : ''}
          </Tag>
        </Tooltip>
      ) : (
        <></>
      ),
  },
  {
    title: 'Is Active',
    dataIndex: 'is_active',
    key: 'is_active',
    render: (isActive: boolean) => (
      <Tag color={isActive ? 'green' : 'red'}>
        {isActive ? 'Active' : 'Inactive'}
      </Tag>
    ),
  },
  {
    title: 'Groups',
    dataIndex: 'groups',
    key: 'groups',
    render: (groups: string[]) =>
      groups?.length ? (
        <Tooltip destroyOnHidden title={groups.join(', ')}>
          <Tag>
            {groups?.length} Group{groups?.length > 1 ? 's' : ''}
          </Tag>
        </Tooltip>
      ) : (
        <></>
      ),
  },
  {
    title: 'Actions',
    dataIndex: 'actions',
    key: 'actions',
    render: (_: unknown, record: User) => <RowActions name={record.name} />,
  },
];

export const UserManagement = () => {
  const [search, setSearch] = useState('');
  const filteredUsers = USER_DATA.filter((user) =>
    user.name?.toLowerCase().includes(search.toLowerCase()),
  );
  const { componentHeight } = useSetComponentHeight({
    offset: 450,
  });
  return (
    <div className="h-[calc(100vh-100px)] css-custom-scrollbar">
      <SectionCard
        title="Link a new user"
        description="Link new user to the platform and configure their roles and organisation permissions."
        rightTitleSlot={<LinkUserDrawer />}
      />
      <SectionCard
        title="Invite a new user"
        description="Invite new user to the platform and configure their roles and organisation permissions."
        rightTitleSlot={<InviteUserDrawer />}
      />
      <SectionCard
        title="Manage existing users"
        description="Manage users and their roles and organisation permissions."
        rightTitleSlot={
          <Input.Search
            className="ml-auto w-60"
            placeholder="Search users"
            onChange={(e) => setSearch(e.target.value)}
            value={search}
          />
        }
      >
        <Table
          rowKey="id"
          scroll={{ y: componentHeight }}
          dataSource={filteredUsers}
          columns={USER_DATA_COLUMNS}
          pagination={false}
        />
      </SectionCard>
    </div>
  );
};
