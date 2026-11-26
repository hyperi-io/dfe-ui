import { buildTestWrapper } from '@/core/utils/test-utils/buildTestWrapper';
import { render, screen } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll, describe, expect, test } from 'vitest';
import { ViewRoleDetails } from './ViewRoleDetails';

const server = setupServer();

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const { wrapper } = buildTestWrapper().withReactQuery().withTheme();

describe('ViewRoleDetails', () => {
  test.each([
    {
      name: 'reader',
      scoped: true,
      resource_type: 'core',
      scope: 'Organisation scoped',
      core: true,
    },
    {
      name: 'org_admin',
      scoped: false,
      resource_type: 'core',
      scope: 'Organisation scoped',
      core: true,
    },
    {
      name: 'reader',
      scoped: false,
      resource_type: 'custom',
      scope: 'System wide',
      core: false,
    },
  ])(
    'shows $name ($resource_type) as $scope',
    async ({ name, scoped, resource_type, scope, core }) => {
      server.use(
        http.get(`/api/v1/auth/roles/${name}`, () =>
          HttpResponse.json({
            name,
            description: 'Reads rules',
            permissions: ['rules:read', 'query:execute'],
            scoped,
            resource_type,
          }),
        ),
      );

      render(<ViewRoleDetails role_name={name} />, { wrapper });

      expect(await screen.findByText(scope)).toBeInTheDocument();
      expect(screen.getByText('query:execute')).toBeInTheDocument();
      expect(screen.queryByText('Core') !== null).toBe(core);
    },
  );
});
