import {
  CUSTOM_ROLE_LIST_RESPONSE,
  PREDEFINED_ROLE_LIST_RESPONSE,
} from '@/Settings/mocks/role.data';
import { IconLock } from '@repo/dfe-icons';
import { Button, Input } from 'antd';
import { useState } from 'react';
import { CreateCustomRoleDrawer } from '../CreateCustomRoleDrawer';
import { SectionCard } from '../SectionCard';
import { RoleCard } from './RoleCard';

export const RoleManagement = () => {
  const [customRoleSearch, setCustomRoleSearch] = useState('');
  const [preDefinedRoleSearch, setPreDefinedRoleSearch] = useState('');

  const [customRoleLimit, setCustomRoleLimit] = useState(4);
  const [preDefinedRoleLimit, setPreDefinedRoleLimit] = useState(4);

  const filteredCustomRoles = CUSTOM_ROLE_LIST_RESPONSE.filter(
    (role) =>
      role.name.toLowerCase().includes(customRoleSearch.toLowerCase()) ||
      role.description
        ?.toLowerCase()
        .includes(customRoleSearch.toLowerCase()) ||
      role.permissions?.some((permission) =>
        permission.toLowerCase().includes(customRoleSearch.toLowerCase()),
      ),
  );
  const filteredPreDefinedRoles = PREDEFINED_ROLE_LIST_RESPONSE.filter(
    (role) =>
      role.name.toLowerCase().includes(preDefinedRoleSearch.toLowerCase()) ||
      role.description
        ?.toLowerCase()
        .includes(preDefinedRoleSearch.toLowerCase()) ||
      role.permissions?.some((permission) =>
        permission.toLowerCase().includes(preDefinedRoleSearch.toLowerCase()),
      ),
  );
  return (
    <div className="h-[calc(100vh-100px)] css-custom-scrollbar">
      <SectionCard
        title="Configure a custom role"
        description="Configure a custom role and its permissions."
        rightTitleSlot={<CreateCustomRoleDrawer />}
      />
      <SectionCard
        title="Manage roles"
        description="Manage custom roles and their permissions."
        rightTitleSlot={
          <Input.Search
            className="ml-auto w-60"
            placeholder="Search custom roles"
            onChange={(e) => setCustomRoleSearch(e.target.value)}
            value={customRoleSearch}
          />
        }
      >
        <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredCustomRoles.slice(0, customRoleLimit).map((role) => (
            <li key={role.id}>
              <RoleCard role={role} />
            </li>
          ))}
        </ul>
        {customRoleLimit < filteredCustomRoles.length && (
          <Button
            type="link"
            className="text-foreground-muted dark:text-dark-foreground-muted text-sm hover:text-tertiary"
            onClick={() => setCustomRoleLimit(customRoleLimit + 4)}
          >
            Show more
          </Button>
        )}
      </SectionCard>
      <SectionCard
        title={
          <span className="flex items-center gap-2">
            <IconLock /> Predefined roles
          </span>
        }
        description="View configured roles and their permissions."
        rightTitleSlot={
          <Input.Search
            className="ml-auto w-60"
            placeholder="Search predefined roles"
            onChange={(e) => setPreDefinedRoleSearch(e.target.value)}
            value={preDefinedRoleSearch}
          />
        }
      >
        <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredPreDefinedRoles.slice(0, preDefinedRoleLimit).map((role) => (
            <li key={role.id}>
              <RoleCard role={role} />
            </li>
          ))}
        </ul>
        {preDefinedRoleLimit < filteredPreDefinedRoles.length && (
          <Button
            type="link"
            className="text-foreground-muted dark:text-dark-foreground-muted text-sm hover:text-tertiary"
            onClick={() => setPreDefinedRoleLimit(preDefinedRoleLimit + 4)}
          >
            Show more
          </Button>
        )}
      </SectionCard>
    </div>
  );
};
