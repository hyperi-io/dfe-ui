interface RoleRequest {
  name: string;
  description?: string;
  permissions?: string[];
  predefined?: boolean;
}

export type Role = RoleRequest & {
  id: string;
};

const createRole = ({
  name,
  description,
  permissions,
  predefined = false,
}: RoleRequest) => {
  return {
    name,
    description,
    permissions,
    predefined,
    id: crypto.randomUUID(),
  };
};
export const CUSTOM_ROLE_LIST_RESPONSE = [
  createRole({
    name: 'Admin',
    description: 'Administrator role',
    permissions: ['*'],
  }),
  createRole({
    name: 'Data Analyst',
    description:
      'Data analyst role that allows read-only access to most resources and dashboards',
    permissions: [
      'read:sources',
      'read:organisations',
      'read:deployments',
      'read:field-maps',
      'read:rules',
      'read:alerts',
      'read:transforms',
      'read:system',
      'read:permissions',
    ],
  }),
  createRole({
    name: 'User Admin',
    description:
      'User admin role that allows full access to user, organisation and role management',
    permissions: [
      'read:users',
      'write:users',
      'delete:users',
      'read:organisations',
      'write:organisations',
      'delete:organisations',
      'read:roles',
      'write:roles',
      'delete:roles',
      'read:permissions',
      'write:permissions',
      'delete:permissions',
    ],
  }),
  createRole({
    name: 'Read Only',
    description:
      'Guest role that allows read-only access to most resources and dashboards',
    permissions: [
      'read:users',
      'read:organisations',
      'read:roles',
      'read:permissions',
    ],
  }),
  createRole({
    name: 'Alert Manager',
    description:
      'Alert manager role that allows full access to alert management',
    permissions: ['read:alerts', 'write:alerts', 'delete:alerts'],
  }),
  createRole({
    name: 'Transform Manager',
    description:
      'Transform manager role that allows full access to transform management',
    permissions: ['read:transforms', 'write:transforms', 'delete:transforms'],
  }),
  createRole({
    name: 'System Admin',
    description:
      'System admin role that allows full access to system management',
    permissions: ['read:system', 'write:system', 'delete:system'],
  }),
  createRole({
    name: 'Source Manager',
    description:
      'Source manager role that allows full access to source management',
    permissions: ['read:sources', 'write:sources', 'delete:sources'],
  }),
  createRole({
    name: 'Deployment Manager',
    description:
      'Deployment manager role that allows full access to deployment management',
    permissions: [
      'read:deployments',
      'write:deployments',
      'delete:deployments',
    ],
  }),
  createRole({
    name: 'Field Map Manager',
    description:
      'Field map manager role that allows full access to field map management',
    permissions: ['read:field-maps', 'write:field-maps', 'delete:field-maps'],
  }),
];

export const CUSTOM_ROLE_DETAILS_RESPONSE = createRole({
  name: 'Admin',
  description: 'Administrator role',
  permissions: ['*'],
});

export const PREDEFINED_ROLE_LIST_RESPONSE = [
  createRole({
    name: 'Admin',
    description: 'Administrator role',
    permissions: ['*'],
    predefined: true,
  }),
  createRole({
    name: 'Data Analyst',
    description:
      'Data analyst role that allows read-only access to most resources and dashboards',
    permissions: [
      'read:sources',
      'read:organisations',
      'read:deployments',
      'read:field-maps',
      'read:rules',
      'read:alerts',
      'read:transforms',
      'read:system',
      'read:permissions',
    ],
    predefined: true,
  }),
  createRole({
    name: 'User Admin',
    description:
      'User admin role that allows full access to user, organisation and role management',
    permissions: [
      'read:users',
      'write:users',
      'delete:users',
      'read:organisations',
      'write:organisations',
      'delete:organisations',
      'read:roles',
      'write:roles',
      'delete:roles',
      'read:permissions',
      'write:permissions',
      'delete:permissions',
    ],
    predefined: true,
  }),
  createRole({
    name: 'Read Only',
    description:
      'Guest role that allows read-only access to most resources and dashboards',
    permissions: [
      'read:users',
      'read:organisations',
      'read:roles',
      'read:permissions',
    ],
    predefined: true,
  }),
  createRole({
    name: 'Alert Manager',
    description:
      'Alert manager role that allows full access to alert management',
    permissions: ['read:alerts', 'write:alerts', 'delete:alerts'],
    predefined: true,
  }),
  createRole({
    name: 'Transform Manager',
    description:
      'Transform manager role that allows full access to transform management',
    permissions: ['read:transforms', 'write:transforms', 'delete:transforms'],
    predefined: true,
  }),
  createRole({
    name: 'System Admin',
    description:
      'System admin role that allows full access to system management',
    permissions: ['read:system', 'write:system', 'delete:system'],
    predefined: true,
  }),
  createRole({
    name: 'Source Manager',
    description:
      'Source manager role that allows full access to source management',
    permissions: ['read:sources', 'write:sources', 'delete:sources'],
    predefined: true,
  }),
  createRole({
    name: 'Deployment Manager',
    description:
      'Deployment manager role that allows full access to deployment management',
    permissions: [
      'read:deployments',
      'write:deployments',
      'delete:deployments',
    ],
    predefined: true,
  }),
  createRole({
    name: 'Field Map Manager',
    description:
      'Field map manager role that allows full access to field map management',
    permissions: ['read:field-maps', 'write:field-maps', 'delete:field-maps'],
    predefined: true,
  }),
];

export const PREDEFINED_ROLE_DETAILS_RESPONSE = createRole({
  name: 'Admin',
  description: 'Administrator role',
  permissions: ['*'],
  predefined: true,
});
