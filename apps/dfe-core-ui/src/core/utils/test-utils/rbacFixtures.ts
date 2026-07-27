import { API_CONFIG_MOCKS } from '@/core/config/api/endpoints/endpoints.generator.mocks';
import type { TAuthMeResponse } from '@/core/hooks/useAuthMe/types';

// Per-role RBAC fixtures for testing the UI AS each role.
//
// This is the UI mirror of the engine's shared OIDC fixture
// (hyperi-infra subprojects/dfe-oidc-testing/fixture.yaml and dfe-engine
// tests/support/rbac_fixtures.py). Same identity names, same roles, same org
// ids - so an engine api-perspective test and a UI visibility test assert the
// SAME user. When the shared fixture changes, update this to match; drift
// between them is the bug this shared vocabulary exists to prevent.
//
// The UI gates on PERMISSIONS (scopes), because roles resolve to scopes
// server-side; the browser only ever sees the resolved `permissions` array from
// /auth/me. The permission sets below are the engine's role -> scope mappings
// (dfe-engine auth/resources/roles.yaml, via docs/control-plane/
// rbac-vocabulary.md), kept as the same wildcard patterns the engine emits -
// isUserAuthorized expands `source:*` etc. exactly as it would in production.
//
// `test_org` is the standard org id every consumer uses; `test_org_2` exists
// only so the multi-org case has a second distinct tenant.

export interface RbacFixture {
  roles: string[];
  permissions: string[];
  org_ids: string[];
}

export const TEST_ORG = 'test_org';
export const TEST_ORG_2 = 'test_org_2';

export const RBAC_FIXTURES = {
  'dfe-admin': {
    roles: ['admin'],
    permissions: ['*'],
    org_ids: [],
  },
  'dfe-infra-admin': {
    roles: ['infra_admin'],
    permissions: [
      'config:*',
      'service:*:config:*',
      'service:*:metrics:read',
      'helm:*',
      'helmvars:*',
      'governance:*',
      'action:invoke:*',
      'deployment:*',
      'argo:*',
      'org:*',
      'group:*',
      'repository:*',
    ],
    org_ids: [],
  },
  'dfe-infra-viewer': {
    roles: ['infra_viewer'],
    permissions: [
      'config:read',
      'service:*:config:read',
      'service:*:metrics:read',
      'helm:compile',
      'deployment:read',
      'argo:applications:get',
      'argo:projects:get',
      'service-surface:read',
      'service:read',
      'org:read',
    ],
    org_ids: [],
  },
  'dfe-analyst': {
    roles: ['data_analyst'],
    permissions: [
      'hunt:*',
      'query:*',
      'source:*',
      'sampler:read',
      'fieldmap:*',
      'alert:*',
      'rule:*',
      'schema:read',
      'schema:write',
      'transforms:*',
      'org:read',
    ],
    org_ids: [],
  },
  'dfe-analyst-viewer': {
    roles: ['data_analyst_viewer'],
    permissions: [
      'hunt:read',
      'query:read',
      'query:execute',
      'source:read',
      'sampler:read',
      'fieldmap:read',
      'alert:read',
      'rule:read',
      'schema:read',
      'org:read',
    ],
    org_ids: [],
  },
  'dfe-viewer': {
    roles: ['data_viewer'],
    permissions: [
      'query:execute',
      'source:read',
      'sampler:read',
      'dashboard:read',
      'org:read',
    ],
    org_ids: [],
  },
  'dfe-operator': {
    roles: ['dfe_operator'],
    permissions: ['governance:read', 'action:invoke:*'],
    org_ids: [],
  },
  'dfe-test-org-viewer': {
    roles: ['customer_viewer'],
    permissions: ['query:execute', 'source:read', 'sampler:read', 'dashboard:read'],
    org_ids: [TEST_ORG],
  },
  'dfe-multi-viewer': {
    roles: ['customer_viewer'],
    permissions: ['query:execute', 'source:read', 'sampler:read', 'dashboard:read'],
    org_ids: [TEST_ORG, TEST_ORG_2],
  },
  // Default deny - the identity people forget. No roles, no permissions.
  'dfe-nobody': {
    roles: [],
    permissions: [],
    org_ids: [],
  },
} as const satisfies Record<string, RbacFixture>;

export type FixtureIdentity = keyof typeof RBAC_FIXTURES;

/** The /auth/me body for a canonical fixture identity. */
export const authMeForRole = (identity: FixtureIdentity): TAuthMeResponse => {
  const fixture = RBAC_FIXTURES[identity];
  return {
    org_id: TEST_ORG,
    user_id: identity,
    roles: [...fixture.roles],
    permissions: [...fixture.permissions],
    groups: [],
    org_ids: [...fixture.org_ids],
  };
};

/**
 * An MSW handler that answers /auth/me AS the given role.
 *
 *   server.use(authMeHandlerForRole('dfe-viewer'))
 *
 * is all a test needs to render the UI from that role's perspective.
 */
export const authMeHandlerForRole = (identity: FixtureIdentity) =>
  API_CONFIG_MOCKS.auth.me.get.success({
    mockedResponse: authMeForRole(identity),
  });
