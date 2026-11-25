import { buildTestWrapper } from '@/core/utils/test-utils/buildTestWrapper';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import {
  afterAll,
  afterEach,
  beforeAll,
  describe,
  expect,
  test,
  vi,
} from 'vitest';
import { API_CONFIG_MOCKS } from '@/core/config/api/endpoints/generator';
import type { TOrganisation } from '@/core/hooks/useFetchSetupStatus/types';
import { ConfigureOrganisationStep } from '.';
import { server } from './ConfigureOrganisation.mocks';

const { wrapper } = buildTestWrapper().withTheme().withReactQuery();

beforeAll(() =>
  server.listen({
    onUnhandledRequest: 'error',
  }),
);
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const submitAnOrganisation = async (goNext: () => void) => {
  const user = userEvent.setup();

  render(
    <ConfigureOrganisationStep
      goNext={goNext}
      goPrevious={vi.fn()}
      organisation={null}
    />,
    { wrapper },
  );

  await user.type(await screen.findByPlaceholderText('Enter name'), 'acme');
  await user.type(screen.getByPlaceholderText('Enter display name'), 'Acme');
  await user.click(screen.getByRole('button', { name: 'Save and continue' }));
};

describe('ConfigureOrganisationStep', () => {
  // The proxy bounces an engine call on the UI host to the login page, and the
  // step used to read that page as an organisation the engine had created.
  test('the login page does not advance the wizard', async () => {
    server.use(
      http.post('/api/v1/orgs', () => HttpResponse.html('<html>Sign in')),
    );
    const goNext = vi.fn();

    await submitAnOrganisation(goNext);

    expect(
      await screen.findByText(/with a web page, not data/),
    ).toBeInTheDocument();
    expect(goNext).not.toHaveBeenCalled();
  });

  test('a created organisation advances the wizard', async () => {
    const goNext = vi.fn();

    await submitAnOrganisation(goNext);

    await waitFor(() => {
      expect(goNext).toHaveBeenCalledTimes(1);
    });
  });

  test('names the created organisation as yours, once', async () => {
    const named = vi.fn();
    server.use(
      http.post('/api/v1/orgs', () =>
        HttpResponse.json({
          name: 'acme',
          display_name: 'Acme',
          org_ids: ['acme'],
          enabled: true,
          created_at: '',
          updated_at: '',
        }),
      ),
      http.put('/api/v1/system/organisation', async ({ request }) => {
        named(request.headers.get('If-None-Match'), await request.json());
        return HttpResponse.json({ name: 'acme', display_name: 'Acme' });
      }),
    );

    await submitAnOrganisation(vi.fn());

    await waitFor(() => {
      expect(named).toHaveBeenCalledWith('*', { name: 'acme' });
    });
  });

  test('a refused naming keeps the wizard on the step', async () => {
    server.use(
      API_CONFIG_MOCKS.system.organisation.put.error({
        mockedResponse: {
          type: 'about:blank',
          title: 'Unprocessable Content',
          status: 422,
          detail: "No enabled org 'acme' is registered",
          code: 'unknown_org',
        },
      }),
    );
    const goNext = vi.fn();

    await submitAnOrganisation(goNext);

    expect(
      await screen.findByText(/No enabled org 'acme' is registered/),
    ).toBeInTheDocument();
    expect(goNext).not.toHaveBeenCalled();
  });

  test('a retry names the organisation an earlier try made', async () => {
    const named = vi.fn();
    server.use(
      http.post('/api/v1/orgs', () =>
        HttpResponse.json(
          {
            type: 'about:blank',
            title: 'Conflict',
            status: 409,
            detail: "Org 'acme' already exists",
            code: 'conflict',
          },
          { status: 409 },
        ),
      ),
      http.put('/api/v1/system/organisation', async ({ request }) => {
        named(await request.json());
        return HttpResponse.json({ name: 'acme', display_name: 'Acme' });
      }),
    );
    const goNext = vi.fn();

    await submitAnOrganisation(goNext);

    await waitFor(() => expect(goNext).toHaveBeenCalledTimes(1));
    expect(named).toHaveBeenCalledWith({ name: 'acme' });
  });

  test('a name refused for another reason keeps that reason', async () => {
    server.use(
      http.post('/api/v1/orgs', () =>
        HttpResponse.json(
          {
            type: 'about:blank',
            title: 'Conflict',
            status: 409,
            detail: "Org 'acme' collides with tenant-fenced org 'beta'",
            code: 'conflict',
          },
          { status: 409 },
        ),
      ),
      API_CONFIG_MOCKS.system.organisation.put.error({
        mockedResponse: {
          type: 'about:blank',
          title: 'Unprocessable Content',
          status: 422,
          detail: "No enabled org 'acme' is registered",
          code: 'unknown_org',
        },
      }),
    );

    await submitAnOrganisation(vi.fn());

    expect(
      await screen.findByText(/collides with tenant-fenced org 'beta'/),
    ).toBeInTheDocument();
  });

  test.each([
    ['no organisation yet', null, ['Save and continue'], ['Next']],
    [
      'an organisation already',
      {
        name: 'acme',
        display_name: 'Acme',
        enabled: true,
        hyperdx_team_id: '',
        hyperdx_team_api_key_env: '',
        ch_password_env: '',
        created_at: '',
        updated_at: '',
      } satisfies TOrganisation,
      ['Next'],
      ['Save and continue'],
    ],
  ])(
    'offers one forward action with %s',
    async (_case, organisation, shown, absent) => {
      render(
        <ConfigureOrganisationStep
          goNext={vi.fn()}
          goPrevious={vi.fn()}
          organisation={organisation}
        />,
        { wrapper },
      );

      for (const name of shown) {
        expect(await screen.findByRole('button', { name })).toBeInTheDocument();
      }
      for (const name of absent) {
        expect(screen.queryByRole('button', { name })).not.toBeInTheDocument();
      }
    },
  );
});
