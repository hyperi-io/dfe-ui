import { API_CONFIG_MOCKS } from '@/core/config/api/endpoints/generator';
import { buildTestWrapper } from '@/core/utils/test-utils/buildTestWrapper';
import { render, screen, waitFor } from '@testing-library/react';
import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll, describe, expect, test } from 'vitest';
import { AccountOrg } from '.';

const server = setupServer(
  API_CONFIG_MOCKS.system.organisation.get.success({
    mockedResponse: { name: 'hyperi', display_name: 'HyperI' },
  }),
);

beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const { wrapper } = buildTestWrapper().withReactQuery().withTheme();

describe('AccountOrg', () => {
  test.each([
    { name: "a customer org's admin", groups: ['acme-admins'], crowned: true },
    {
      name: "a customer org's viewer",
      groups: ['acme-viewers'],
      crowned: false,
    },
  ])('crowns $name only when it is the admin', async ({ crowned, groups }) => {
    render(<AccountOrg displayName="Acme Corp" groups={groups} org="acme" />, {
      wrapper,
    });

    expect(await screen.findByText('Acme Corp')).toBeInTheDocument();
    await waitFor(() =>
      expect(screen.queryByLabelText('Admin of Acme Corp') !== null).toBe(
        crowned,
      ),
    );
  });

  test('crowns no account of your organisation', async () => {
    render(<AccountOrg displayName="HyperI" groups={['dfe-admins']} org="" />, {
      wrapper,
    });

    expect(await screen.findByText('HyperI')).toBeInTheDocument();
    expect(screen.queryByLabelText(/^Admin of/)).not.toBeInTheDocument();
  });
});
