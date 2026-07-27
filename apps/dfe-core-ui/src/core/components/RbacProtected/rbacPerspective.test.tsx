import { useAuthMe } from '@/core/hooks/useAuthMe';
import { useAuthStore } from '@/core/stores/authStore';
import { buildTestWrapper } from '@/core/utils/test-utils/buildTestWrapper';
import {
  authMeHandlerForRole,
  type FixtureIdentity,
} from '@/core/utils/test-utils/rbacFixtures';
import { render, screen } from '@testing-library/react';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { RbacProtected } from '.';
import { UI_DISPLAY_ACTIONS } from './hooks/rbac.constants';
import { server } from './rbacPerspective.mocks';

// Test the UI AS each RBAC role - the browser-side counterpart to the engine's
// tests/unit/test_api/test_rbac_perspective.py. Same identities, same
// contract: the engine proves the API allows/denies the right actions; this
// proves the UI SHOWS/HIDES the matching surfaces. Together they cover "the
// platform behaves and looks right for this role", which is what a real user
// experiences.
//
// The five probes below are representative of the two orthogonal planes:
//   - data plane   : source:read (view data), source:write (change it)
//   - control plane: deployment:read, deployment:write, governance:read (infra)
// The infra family is the trap worth guarding: infra_admin is an "admin" but
// has NO data-plane scope, so it must NOT see source surfaces - and a data role
// must NOT see infra surfaces.

const { wrapper } = buildTestWrapper().withReactQuery();

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => {
  server.resetHandlers();
  useAuthStore.getState().reset();
});
afterAll(() => server.close());

const PROBES = [
  { id: 'source-read', action: UI_DISPLAY_ACTIONS.source_read },
  { id: 'source-write', action: UI_DISPLAY_ACTIONS.source_write },
  { id: 'deployment-read', action: UI_DISPLAY_ACTIONS.deployment_read },
  { id: 'deployment-write', action: UI_DISPLAY_ACTIONS.deployment_write },
  { id: 'governance-read', action: UI_DISPLAY_ACTIONS.governance_read },
] as const;

type ProbeId = (typeof PROBES)[number]['id'];

// What each identity should be able to SEE. Everything not listed must be
// hidden. Derived from the engine role -> scope mappings (roles.yaml).
const EXPECTED_VISIBLE: Record<FixtureIdentity, ProbeId[]> = {
  'dfe-admin': [
    'source-read',
    'source-write',
    'deployment-read',
    'deployment-write',
    'governance-read',
  ],
  'dfe-infra-admin': ['deployment-read', 'deployment-write', 'governance-read'],
  'dfe-infra-viewer': ['deployment-read'],
  'dfe-analyst': ['source-read', 'source-write'],
  'dfe-analyst-viewer': ['source-read'],
  'dfe-viewer': ['source-read'],
  'dfe-operator': ['governance-read'],
  'dfe-test-org-viewer': ['source-read'],
  'dfe-multi-viewer': ['source-read'],
  'dfe-nobody': [],
};

// Renders once /auth/me has resolved, so the negative assertions (a probe that
// must stay hidden) are checked against settled auth state, not the loading gap
// where RbacProtected renders nothing anyway.
const MeLoaded = () => {
  const { isLoading } = useAuthMe();
  return isLoading ? null : <div data-testid="me-loaded" />;
};

const Probe = ({ id, action }: (typeof PROBES)[number]) => (
  <RbacProtected action={action}>
    <RbacProtected.Unrestricted>
      <span data-testid={`allow-${id}`} />
    </RbacProtected.Unrestricted>
  </RbacProtected>
);

const Panel = () => (
  <>
    <MeLoaded />
    {PROBES.map((probe) => (
      <Probe key={probe.id} {...probe} />
    ))}
  </>
);

describe('RBAC perspective - what each role sees', () => {
  const identities = Object.keys(EXPECTED_VISIBLE) as FixtureIdentity[];

  it.each(identities)(
    '%s sees exactly its authorised surfaces',
    async (identity) => {
      server.use(authMeHandlerForRole(identity));
      render(<Panel />, { wrapper });

      // Wait for /auth/me to resolve before asserting hidden surfaces.
      await screen.findByTestId('me-loaded');

      const visible = new Set(EXPECTED_VISIBLE[identity]);
      for (const probe of PROBES) {
        const el = screen.queryByTestId(`allow-${probe.id}`);
        if (visible.has(probe.id)) {
          expect(el, `${identity} should see ${probe.id}`).toBeInTheDocument();
        } else {
          expect(
            el,
            `${identity} must NOT see ${probe.id}`,
          ).not.toBeInTheDocument();
        }
      }
    },
  );
});
