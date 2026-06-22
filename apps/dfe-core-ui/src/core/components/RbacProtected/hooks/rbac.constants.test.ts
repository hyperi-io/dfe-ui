import { uniq } from 'lodash';
import { describe, expect, it } from 'vitest';
import { UI_DISPLAY_ACTIONS } from './rbac.constants';

const account_groups_scopes = {
  group_write: 'group:write',
  group_read: 'group:read',
  group_delete: 'group:delete',
  group_add_member: 'group:add_member',
  group_remove_member: 'group:remove_member',
};

const accounts_scopes = {
  account_write: 'account:write',
  account_read: 'account:read',
  account_delete: 'account:delete',
  accounts_reset_password: 'accounts:reset_password',
};

const alerts_scopes = {
  alert_read: 'alert:read',
  alert_write: 'alert:write',
  alert_delete: 'alert:delete',
};

const api_keys_scopes = {
  api_key_read: 'api_key:read',
  api_key_write: 'api_key:write',
  api_key_delete: 'api_key:delete',
};

const cel_scopes = {
  cel_check: 'cel:check',
};

const dashboard_scopes = { dashboard_read: 'dashboard:read' };

const deployment_scopes = {
  deployment_read: 'deployment:read',
  deployment_write: 'deployment:write',
  deployment_delete: 'deployment:delete',
};

const discovery_scopes = {
  discovery_read: 'discovery:read',
};

const fieldmap_scopes = {
  fieldmap_read: 'fieldmap:read',
  fieldmap_write: 'fieldmap:write',
  fieldmap_delete: 'fieldmap:delete',
};

const hunt_scopes = {
  hunt_read: 'hunt:read',
  hunt_execute: 'hunt:execute',
};

const oidc_scopes = {
  oidc_read: 'oidc:read',
  oidc_write: 'oidc:write',
  oidc_delete: 'oidc:delete',
};

const org_scopes = {
  org_read: 'org:read',
  org_write: 'org:write',
  org_delete: 'org:delete',
};

const pipeline_scopes = {
  pipeline_read: 'pipeline:read',
  pipeline_write: 'pipeline:write',
};

const query_scopes = {
  query_read: 'query:read',
  query_execute: 'query:execute',
};

const role_scopes = {
  role_read: 'role:read',
  role_write: 'role:write',
  role_delete: 'role:delete',
  role_scopes: 'role:scopes',
};

const rules_scopes = {
  rule_write: 'rule:write',
  rule_delete: 'rule:delete',
  rule_validate: 'rule:validate',
};

const schemas_scopes = {
  schema_read: 'schema:read',
  schema_write: 'schema:write',
  schema_delete: 'schema:delete',
};

const service_surfaces_scopes = {
  service_surface_read: 'service_surface:read',
  service_surface_write: 'service_surface:write',
};

const services_scopes = {
  service_read: 'service:read',
  service_write: 'service:write',
  service_delete: 'service:delete',
  service_validate: 'service:validate',
};

const sigma_scopes = {
  sigma_read: 'sigma:read',
  sigma_write: 'sigma:write',
};

const source_scopes = {
  source_read: 'source:read',
  source_write: 'source:write',
  source_delete: 'source:delete',
};

const system_scopes = {
  system_read: 'system:read',
};

const tasks_scopes = {
  task_read: 'task:read',
  task_write: 'task:write',
};

const transform_scopes = {
  transform_compile: 'transform:compile',
  transform_test: 'transform:test',
};

const UI_DISPLAY_ACTIONS_CLONED = {
  ...account_groups_scopes,
  ...accounts_scopes,
  ...alerts_scopes,
  ...api_keys_scopes,
  ...cel_scopes,
  ...dashboard_scopes,
  ...deployment_scopes,
  ...discovery_scopes,
  ...fieldmap_scopes,
  ...hunt_scopes,
  ...oidc_scopes,
  ...org_scopes,
  ...pipeline_scopes,
  ...query_scopes,
  ...role_scopes,
  ...rules_scopes,
  ...schemas_scopes,
  ...service_surfaces_scopes,
  ...services_scopes,
  ...sigma_scopes,
  ...source_scopes,
  ...system_scopes,
  ...tasks_scopes,
  ...transform_scopes,
};

describe('UI_DISPLAY_ACTIONS', () => {
  it('should have the correct actions', () => {
    expect(UI_DISPLAY_ACTIONS).toBeDefined();
  });

  it('should have unique actions', () => {
    const actions = Object.values(UI_DISPLAY_ACTIONS);
    const testUniqueActions = uniq(actions);
    expect(testUniqueActions).toEqual(actions);
  });

  it('should have the correct actions for each permission', () => {
    // Prevent accidental modification of the ROLE_ACTIONS_MAPPINGS object
    // Please double check the mappings before updating the test object
    expect(UI_DISPLAY_ACTIONS).toEqual(UI_DISPLAY_ACTIONS_CLONED);
  });
});
