import { uniq } from 'lodash';
import { describe, expect, it } from 'vitest';
import { UI_DISPLAY_ACTIONS } from './rbac.constants';

const UI_DISPLAY_ACTIONS_CLONED = {
  ALERT_READ: 'alert:read',
  ALERT_WRITE: 'alert:write',
  ARGO_APPLICATIONS: 'argo:applications',
  ARGO_APPLICATIONS_GET: 'argo:applications:get',
  ARGO_PROJECTS: 'argo:projects',
  ARGO_PROJECTS_GET: 'argo:projects:get',
  CONFIG_READ: 'config:read',
  CONFIG_WRITE: 'config:write',
  DASHBOARD_READ: 'dashboard:read',
  DEPLOYMENT_READ: 'deployment:read',
  DEPLOYMENT_WRITE: 'deployment:write',
  DISCOVERY_READ: 'discovery:read',
  FIELDMAP_READ: 'fieldmap:read',
  FIELDMAP_WRITE: 'fieldmap:write',
  HELM_COMPILE: 'helm:compile',
  HELM_CREATE_TOPICS: 'helm:create_topics',
  HELM_EXECUTE_DDL: 'helm:execute_ddl',
  HUNT_EXECUTE: 'hunt:execute',
  HUNT_READ: 'hunt:read',
  HUNT_WRITE: 'hunt:write',
  ORG_READ: 'org:read',
  ORG_WRITE: 'org:write',
  QUERY_EXECUTE: 'query:execute',
  QUERY_READ: 'query:read',
  QUERY_WRITE: 'query:write',
  SCHEMA_DELETE: 'schema:delete',
  SCHEMA_READ: 'schema:read',
  SCHEMA_WRITE: 'schema:write',
  SERVICE_CONFIG_READ: 'service:*:config:read',
  SERVICE_CONFIG_WRITE: 'service:*:config:write',
  SERVICE_METRICS_READ: 'service:*:metrics:read',
  SOURCE_READ: 'source:read',
  SOURCE_WRITE: 'source:write',
  TRANSFORMS_COMPILE: 'transforms:compile',
  TRANSFORMS_TEST: 'transforms:test',
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
