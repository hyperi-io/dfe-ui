import { API_CONFIG_MOCKS } from '@/core/config/api/endpoints/generator';
import { buildTestWrapper } from '@/core/utils/test-utils/buildTestWrapper';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { AppConfigCard } from '.';
import { CONFIG_URL, INSTANCE, SERVICE, server } from './AppConfigCard.mocks';

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const { wrapper } = buildTestWrapper().withTheme().withReactQuery();

const renderCard = () =>
  render(<AppConfigCard service={SERVICE} instance={INSTANCE} />, { wrapper });

const capturePut = (body: { current: Record<string, unknown> | null }) =>
  http.put(CONFIG_URL, async ({ request }) => {
    body.current = (await request.json()) as Record<string, unknown>;
    return HttpResponse.json({
      changed: true,
      commit_sha: 'abc1234',
      auto_merged: true,
      review_required: false,
      pr_url: null,
      validation: null,
      reload: 'roll',
      custom_env: '',
    });
  });

describe('AppConfigCard', () => {
  it('shows every declared option, grouped by the section its path names', async () => {
    renderCard();

    expect(
      await screen.findByText('Maximum records per batch'),
    ).toBeInTheDocument();
    expect(screen.getByText('Kafka brokers')).toBeInTheDocument();
    expect(screen.getByText('Log level')).toBeInTheDocument();
    expect(screen.getByText('batch')).toBeInTheDocument();
    expect(screen.getByText('kafka')).toBeInTheDocument();
    expect(screen.getByText('general')).toBeInTheDocument();
  });

  // Derek's rule: a default renders as grey placeholder text, never as a value
  // sitting in the box where it cannot be told apart from something set.
  it('renders an unset option with its default as placeholder, not as a value', async () => {
    renderCard();

    const input = await screen.findByLabelText('Maximum records per batch');
    expect(input).toHaveValue('');
    expect(input).toHaveAttribute('placeholder', '1000');
  });

  it('marks an override so it cannot be mistaken for a default', async () => {
    renderCard();

    await screen.findByText('Batch timeout');
    const option = screen.getByRole('group', {
      name: 'config.batch.timeout_ms',
    });
    expect(within(option).getByText('override')).toBeInTheDocument();
    expect(screen.getByLabelText('Batch timeout')).toHaveValue('200');
  });

  // An option running its own default is not an override, and must not carry
  // the marker that says it is.
  it('does not mark an option that is merely running its default', async () => {
    renderCard();

    await screen.findByText('Maximum records per batch');
    const option = screen.getByRole('group', {
      name: 'config.batch.max_records',
    });
    expect(within(option).queryByText('override')).not.toBeInTheDocument();
    expect(within(option).getByText('default')).toBeInTheDocument();
  });

  // chart is its own state: not a default, not a blank box. Folding it into
  // either tells the operator the wrong story about where the value came from.
  it('renders a chart-derived option as its own state and refuses the edit', async () => {
    renderCard();

    await screen.findByText('Kafka brokers');
    expect(screen.getByText('set by the deployment')).toBeInTheDocument();
    expect(screen.getByLabelText('Kafka brokers')).toBeDisabled();
  });

  it('never renders a secret value, only whether one is set', async () => {
    renderCard();

    await screen.findByText('Kafka SASL password');
    expect(screen.getByText('secret set')).toBeInTheDocument();
    expect(screen.getByLabelText('Kafka SASL password')).toHaveValue('');
  });

  // The failure this page exists to avoid: opening it and saving must not turn
  // a screenful of defaults into a screenful of overrides.
  it('has nothing to save until something is actually edited', async () => {
    renderCard();

    await screen.findByText('Log level');
    expect(
      screen.getByRole('button', { name: 'Save settings' }),
    ).toBeDisabled();
  });

  it('sends only the option that was edited, never the untouched defaults', async () => {
    const user = userEvent.setup();
    const body: { current: Record<string, unknown> | null } = { current: null };
    server.use(capturePut(body));

    renderCard();

    const input = await screen.findByLabelText('Maximum records per batch');
    await user.type(input, '250');
    await user.click(screen.getByRole('button', { name: 'Save 1 change' }));

    await waitFor(() => expect(body.current).not.toBeNull());
    expect(body.current).toEqual({
      changes: { 'config.batch.max_records': 250 },
    });
  });

  it('guards the write with the revision it read', async () => {
    const user = userEvent.setup();
    let ifMatch: string | null = null;
    server.use(
      http.put(CONFIG_URL, ({ request }) => {
        ifMatch = request.headers.get('If-Match');
        return HttpResponse.json({ changed: true, commit_sha: 'ccc' });
      }),
    );

    renderCard();

    const input = await screen.findByLabelText('Maximum records per batch');
    await user.type(input, '7');
    await user.click(screen.getByRole('button', { name: 'Save 1 change' }));

    await waitFor(() => expect(ifMatch).not.toBeNull(), { timeout: 15000 });
    expect(ifMatch).toBe('aaaaaaa1111');
  }, 20000);

  // A refusal the operator can act on: the reason lands on the box that caused
  // it, not as a sentence at the bottom of a page of forty options.
  it('shows a chart-set refusal against the option it refused', async () => {
    const user = userEvent.setup();
    server.use(
      API_CONFIG_MOCKS.apps.config.put.chartDerived({
        service: SERVICE,
        instance: INSTANCE,
        path: 'config.batch.max_records',
        message: 'the deployment sets this through kafka.mode',
      }),
    );

    renderCard();

    const input = await screen.findByLabelText('Maximum records per batch');
    await user.type(input, '250');
    await user.click(screen.getByRole('button', { name: 'Save 1 change' }));

    const alert = await screen.findByRole('alert', {}, { timeout: 15000 });
    expect(alert).toHaveTextContent(
      'the deployment sets this through kafka.mode',
    );
  }, 20000);

  it('shows a refused custom env key against that key', async () => {
    const user = userEvent.setup();
    server.use(
      API_CONFIG_MOCKS.apps.config.put.chartSetEnv({
        service: SERVICE,
        instance: INSTANCE,
        path: 'extraEnv.RUST_BACKTRACE',
        message: 'the dfe-loader chart sets RUST_BACKTRACE itself',
      }),
    );

    renderCard();

    const input = await screen.findByLabelText('extraEnv.RUST_BACKTRACE');
    await user.clear(input);
    await user.type(input, '0');
    await user.click(screen.getByRole('button', { name: 'Save 1 change' }));

    const alert = await screen.findByRole('alert', {}, { timeout: 15000 });
    expect(alert).toHaveTextContent(
      'the dfe-loader chart sets RUST_BACKTRACE itself',
    );
  }, 20000);

  // A git write can fail for reasons no field can express. If the refusal names
  // a path that is not on screen, hanging it on that box would lose it, so it
  // has to fall back to the card.
  it('shows a refusal naming an off-screen path at card level rather than losing it', async () => {
    const user = userEvent.setup();
    server.use(
      API_CONFIG_MOCKS.apps.config.put.chartDerived({
        service: SERVICE,
        instance: INSTANCE,
        path: 'config.some.option.this.page.never.rendered',
        message: 'the deployment sets this through kafka.mode',
      }),
    );

    renderCard();

    const input = await screen.findByLabelText('Maximum records per batch');
    await user.type(input, '250');
    await user.click(screen.getByRole('button', { name: 'Save 1 change' }));

    expect(
      await screen.findByText(
        'the deployment sets this through kafka.mode',
        {},
        { timeout: 15000 },
      ),
    ).toBeInTheDocument();
  }, 20000);

  // The write is a commit in the deploy repo, not a live change, so the result
  // must not read as though the app is already running the new value.
  it('reports a save as committed, with when the process will see it', async () => {
    const user = userEvent.setup();
    server.use(
      API_CONFIG_MOCKS.apps.config.put.success({
        service: SERVICE,
        instance: INSTANCE,
      }),
    );

    renderCard();

    const input = await screen.findByLabelText('Maximum records per batch');
    await user.type(input, '250');
    await user.click(screen.getByRole('button', { name: 'Save 1 change' }));

    expect(
      await screen.findByText('Committed', {}, { timeout: 15000 }),
    ).toBeInTheDocument();
    expect(
      screen.getByText('Takes effect when the pod rolls'),
    ).toBeInTheDocument();
  }, 20000);

  it('says how a custom env key reaches the container when the engine explains it', async () => {
    const user = userEvent.setup();
    server.use(
      API_CONFIG_MOCKS.apps.config.put.success({
        service: SERVICE,
        instance: INSTANCE,
        mockedResponse: {
          changed: true,
          commit_sha: 'abc1234',
          auto_merged: true,
          review_required: false,
          pr_url: null,
          validation: null,
          reload: 'roll',
          custom_env: 'the app own chart renders extraEnv onto the container',
        },
      }),
    );

    renderCard();

    await user.clear(await screen.findByLabelText('extraEnv.RUST_BACKTRACE'));
    await user.type(screen.getByLabelText('extraEnv.RUST_BACKTRACE'), '0');
    await user.click(screen.getByRole('button', { name: 'Save 1 change' }));

    expect(
      await screen.findByText(
        'the app own chart renders extraEnv onto the container',
        {},
        { timeout: 15000 },
      ),
    ).toBeInTheDocument();
  }, 20000);

  it('adds a custom env key beside the declared options', async () => {
    const user = userEvent.setup();
    const body: { current: Record<string, unknown> | null } = { current: null };
    server.use(capturePut(body));

    renderCard();

    const name = await screen.findByLabelText('New environment key');
    await user.type(name, 'EXTRA_KEY');
    await user.click(screen.getByRole('button', { name: 'Add key' }));

    await user.type(screen.getByLabelText('extraEnv.EXTRA_KEY'), 'yes');
    await user.click(screen.getByRole('button', { name: 'Save 1 change' }));

    await waitFor(() => expect(body.current).not.toBeNull());
    expect(body.current).toEqual({ changes: { 'extraEnv.EXTRA_KEY': 'yes' } });
  });

  // A custom key is the one thing on this surface that CAN be cleared: the
  // engine deletes the key when the write carries a null for it.
  it('removes a custom env key by sending a null for it', async () => {
    const user = userEvent.setup();
    const body: { current: Record<string, unknown> | null } = { current: null };
    server.use(capturePut(body));

    renderCard();

    await screen.findByText('RUST_BACKTRACE');
    await user.click(screen.getByRole('button', { name: 'Remove' }));
    await user.click(screen.getByRole('button', { name: 'Save 1 change' }));

    await waitFor(() => expect(body.current).not.toBeNull());
    expect(body.current).toEqual({
      changes: { 'extraEnv.RUST_BACKTRACE': null },
    });
  });

  it('names the overlay keys the contract no longer declares', async () => {
    renderCard();

    expect(
      await screen.findByText('Overlay keys the contract does not declare'),
    ).toBeInTheDocument();
    expect(screen.getByText('config.retired_option')).toBeInTheDocument();
  });

  // Not an empty field list: a deployment with no contract mounted says so.
  it('says so when the deployment has mounted no contract for the app', async () => {
    server.use(
      API_CONFIG_MOCKS.apps.config.get.unavailable({
        service: SERVICE,
        instance: INSTANCE,
      }),
    );

    renderCard();

    expect(
      await screen.findByText('No container contract is mounted'),
    ).toBeInTheDocument();
    expect(screen.queryByText('Log level')).not.toBeInTheDocument();
  });

  it('reports a read that failed rather than rendering an empty form', async () => {
    server.use(
      http.get(CONFIG_URL, () =>
        HttpResponse.json(
          { code: 'internal_error', message: 'engine is down' },
          { status: 500 },
        ),
      ),
    );

    renderCard();

    expect(
      await screen.findByText("Could not read the app's options"),
    ).toBeInTheDocument();
  });
});
