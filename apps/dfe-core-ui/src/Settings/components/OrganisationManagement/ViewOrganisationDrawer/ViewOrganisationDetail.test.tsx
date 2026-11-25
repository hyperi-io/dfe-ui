import { API_CONFIG_MOCKS } from '@/core/config/api/endpoints/generator';
import { buildTestWrapper } from '@/core/utils/test-utils/buildTestWrapper';
import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll, describe, expect, test } from 'vitest';
import { ViewOrganisationDetail } from './ViewOrganisationDetail';

const server = setupServer();

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const { wrapper } = buildTestWrapper().withReactQuery().withTheme();

describe('ViewOrganisationDetail', () => {
  test.each([
    { org: 'globex', yours: 'acme', status: 'Disabled', ownTag: false },
    { org: 'acme', yours: 'acme', status: null, ownTag: true },
  ])(
    'shows $org with your organisation $yours',
    async ({ org, yours, status, ownTag }) => {
      server.use(
        API_CONFIG_MOCKS.system.organisation.get.success({
          mockedResponse: { name: yours, display_name: 'Yours' },
        }),
        http.get(`/api/v1/orgs/${org}`, () =>
          HttpResponse.json({
            name: org,
            display_name: 'Shown',
            org_ids: [org, `${org}-eu`],
            enabled: false,
            created_at: '2026-11-16T09:48:14Z',
            updated_at: '2026-11-21T04:03:16Z',
          }),
        ),
      );

      render(<ViewOrganisationDetail org_name={org} display_name="Shown" />, {
        wrapper,
      });

      expect(await screen.findByText(`${org}-eu`)).toBeInTheDocument();
      // Which organisation is yours arrives on its own request.
      await waitFor(() =>
        expect(
          screen.queryByText(status ?? 'Your organisation'),
        ).toBeInTheDocument(),
      );
      expect(screen.queryByText('Status:') !== null).toBe(status !== null);
      expect(screen.queryByText('Your organisation') !== null).toBe(ownTag);
    },
  );
});
