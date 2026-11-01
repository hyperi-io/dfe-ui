import { buildTestWrapper } from '@/core/utils/test-utils/buildTestWrapper';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { App } from 'antd';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import {
  afterAll,
  afterEach,
  beforeAll,
  describe,
  expect,
  it,
  vi,
} from 'vitest';
import { BuildDeployTab } from './BuildDeployTab';

const PR = 'https://github.com/acme/deploy/pull/7';
const server = setupServer();
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const { wrapper } = buildTestWrapper()
  .withReactQuery()
  .withWrapper(({ children }) => <App>{children}</App>);

const answer = (body: object) =>
  server.use(http.post('/api/v1/sources/bulk', () => HttpResponse.json(body)));

const deploy = async (onSuccess: () => void) => {
  const user = userEvent.setup();
  render(
    <BuildDeployTab
      appliedSources={[
        { source: 'okta', version: '1.0.1' },
        { source: 'syslog', version: '2.0.0' },
      ]}
      onSuccess={onSuccess}
    />,
    { wrapper },
  );
  await user.click(screen.getAllByRole('checkbox')[0]!);
  await user.click(
    screen.getByRole('button', { name: 'Update Configurations' }),
  );
};

describe('BuildDeployTab', () => {
  it('says the sources await review and moves nothing when all are held', async () => {
    answer({
      action: 'deploy',
      review_required: true,
      pr_url: PR,
      awaiting_review: ['okta', 'syslog'],
    });
    const onSuccess = vi.fn();

    await deploy(onSuccess);

    expect(
      await screen.findByText('2 sources awaiting review'),
    ).toBeInTheDocument();
    expect(screen.getByText(/okta, syslog/)).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'Open the review request' }),
    ).toHaveAttribute('href', PR);
    expect(screen.queryByText('Deployments successfully queued')).toBeNull();
    expect(onSuccess).not.toHaveBeenCalled();
  });

  it('reports both when some were queued and some are held', async () => {
    answer({
      action: 'deploy',
      review_required: true,
      pr_url: PR,
      succeeded: ['syslog'],
      awaiting_review: ['okta'],
    });
    const onSuccess = vi.fn();

    await deploy(onSuccess);

    expect(
      await screen.findByText('1 source awaiting review'),
    ).toBeInTheDocument();
    expect(
      screen.getByText('Deployments successfully queued'),
    ).toBeInTheDocument();
    await waitFor(() => expect(onSuccess).toHaveBeenCalledOnce());
  });

  it('only reports the queue when nothing is held', async () => {
    answer({ action: 'deploy', review_required: false, succeeded: ['okta'] });
    const onSuccess = vi.fn();

    await deploy(onSuccess);

    expect(
      await screen.findByText('Deployments successfully queued'),
    ).toBeInTheDocument();
    expect(screen.queryByText(/awaiting review/)).toBeNull();
    await waitFor(() => expect(onSuccess).toHaveBeenCalledOnce());
  });
});
