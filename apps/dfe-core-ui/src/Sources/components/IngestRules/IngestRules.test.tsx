import { API_CONFIG_MOCKS } from '@/core/config/api/endpoints/generator';
import { buildTestWrapper } from '@/core/utils/test-utils/buildTestWrapper';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { DeploymentCompatibility } from './DeploymentCompatibility';
import { server } from './IngestRules.mocks';
import { RuleOrder } from './RuleOrder';

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const { wrapper } = buildTestWrapper().withTheme().withReactQuery();

type Captured = { ifMatch: string | null; body: unknown };

const captureOrder = (captured: Captured[]) =>
  http.post('/api/v1/ingest/rules/order', async ({ request }) => {
    captured.push({
      ifMatch: request.headers.get('If-Match'),
      body: await request.json(),
    });
    return HttpResponse.json({
      dry_run: false,
      reload: 'hot',
      apps_synced: [],
      restart_required: [],
      target: '_source',
      blocks: [],
    });
  });

const sourceList = () =>
  screen.findByRole('list', { name: 'Source rules order' });

const sourceOrder = async () =>
  within(await sourceList())
    .getAllByRole('listitem')
    .map((item) => item.getAttribute('data-testid'));

describe('RuleOrder', () => {
  it('lists each field in the order it runs, profiles by title and the default pinned last', async () => {
    render(<RuleOrder />, { wrapper });

    expect(await sourceOrder()).toEqual([
      'rule-block-source.cisco-ios',
      'rule-block-source.okta',
      'rule-block-compat.dfe-legacy-2x',
      'rule-block-default',
    ]);
    const list = await sourceList();
    expect(
      await within(list).findByText('DFE 2.0 and 2.1 senders'),
    ).toBeInTheDocument();
    expect(within(list).getByRole('link', { name: 'okta' })).toHaveAttribute(
      'href',
      '/sources?source_name=okta',
    );
    expect(
      screen.getByRole('list', { name: 'Org rules order' }),
    ).toBeInTheDocument();
  });

  it('saves a move with the revision it was read at and every movable block', async () => {
    const user = userEvent.setup();
    const captured: Captured[] = [];
    server.use(captureOrder(captured));
    render(<RuleOrder />, { wrapper });

    await user.click(
      await screen.findByRole('button', { name: 'Move okta up' }),
    );
    expect(
      screen.getByText('This order is not saved yet.'),
    ).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Save order' }));

    await waitFor(() => expect(captured).toHaveLength(1));
    expect(captured[0]).toEqual({
      ifMatch: '"order-1"',
      body: {
        target: '_source',
        blocks: ['source.okta', 'source.cisco-ios', 'compat.dfe-legacy-2x'],
      },
    });
    expect(await screen.findByText('Order saved')).toBeInTheDocument();
  });

  it('explains a 409 with the blocks that changed and reloads them for a retry', async () => {
    const user = userEvent.setup();
    server.use(API_CONFIG_MOCKS.ingest.rulesOrder.post.error());
    render(<RuleOrder />, { wrapper });

    await user.click(
      await screen.findByRole('button', { name: 'Move okta up' }),
    );
    await user.click(screen.getByRole('button', { name: 'Save order' }));

    expect(
      await screen.findByText('The blocks changed since this page loaded'),
    ).toBeInTheDocument();
    // Named as the list names them, not by block id.
    expect(screen.getByText('Added since: syslog')).toBeInTheDocument();
    expect(
      screen.getByText('Gone since: DFE 2.0 and 2.1 senders'),
    ).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Reload' }));

    await waitFor(() =>
      expect(
        screen.queryByText('The blocks changed since this page loaded'),
      ).not.toBeInTheDocument(),
    );
    expect((await sourceOrder())[0]).toBe('rule-block-source.cisco-ios');
  });

  it('says someone else changed the order first on a 412', async () => {
    const user = userEvent.setup();
    server.use(
      API_CONFIG_MOCKS.ingest.rulesOrder.post.error({
        status: 412,
        body: {
          code: 'etag_mismatch',
          message: 'If-Match does not match the current ETag',
          context: { etag: '"order-2"' },
        },
      }),
    );
    render(<RuleOrder />, { wrapper });

    await user.click(
      await screen.findByRole('button', { name: 'Move okta up' }),
    );
    await user.click(screen.getByRole('button', { name: 'Save order' }));

    expect(
      await screen.findByText('Someone else changed this first'),
    ).toBeInTheDocument();
  });

  it('will not save without a revision the browser can read', async () => {
    const user = userEvent.setup();
    server.use(API_CONFIG_MOCKS.ingest.rules.get.success({ etag: null }));
    render(<RuleOrder />, { wrapper });

    expect(
      await screen.findByText('This order is read only here'),
    ).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Move okta up' }));

    expect(screen.getByRole('button', { name: 'Save order' })).toBeDisabled();
  });
});

describe('DeploymentCompatibility', () => {
  it('binds a profile for every source and saves it against the revision read', async () => {
    const user = userEvent.setup();
    const captured: Captured[] = [];
    server.use(
      http.put('/api/v1/ingest/compat', async ({ request }) => {
        captured.push({
          ifMatch: request.headers.get('If-Match'),
          body: await request.json(),
        });
        return HttpResponse.json({
          dry_run: false,
          reload: 'hot',
          apps_synced: [],
          restart_required: [],
          profiles: [{ profile: 'elastic-agent' }],
        });
      }),
    );
    render(<DeploymentCompatibility />, { wrapper });

    await user.click(
      await screen.findByRole('switch', {
        name: 'Bind Elastic Agent and Beats',
      }),
    );
    await user.click(screen.getByRole('button', { name: 'Save profiles' }));

    await waitFor(() => expect(captured).toHaveLength(1));
    expect(captured[0]).toEqual({
      ifMatch: '"compat-1"',
      body: { profiles: [{ profile: 'elastic-agent' }] },
    });
    expect(await screen.findByText('Profiles saved')).toBeInTheDocument();
  });

  it('offers the optional rows of a bound profile', async () => {
    const user = userEvent.setup();
    render(<DeploymentCompatibility />, { wrapper });

    await user.click(
      await screen.findByRole('switch', {
        name: 'Bind Elastic Agent and Beats',
      }),
    );

    expect(
      screen.getByRole('checkbox', { name: 'org-from-namespace' }),
    ).toBeInTheDocument();
  });

  it('asks for a reload when the bindings moved under the save', async () => {
    const user = userEvent.setup();
    server.use(API_CONFIG_MOCKS.ingest.compat.put.error());
    render(<DeploymentCompatibility />, { wrapper });

    await user.click(
      await screen.findByRole('switch', {
        name: 'Bind DFE 2.0 and 2.1 senders',
      }),
    );
    await user.click(screen.getByRole('button', { name: 'Save profiles' }));

    expect(
      await screen.findByText('Someone else changed this first'),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Reload' })).toBeInTheDocument();
  });
});
