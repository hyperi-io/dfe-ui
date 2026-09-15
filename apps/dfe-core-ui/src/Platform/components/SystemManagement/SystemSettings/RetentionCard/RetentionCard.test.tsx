import { API_CONFIG_MOCKS } from '@/core/config/api/endpoints/generator';
import { buildTestWrapper } from '@/core/utils/test-utils/buildTestWrapper';
import { render, screen } from '@testing-library/react';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { RetentionCard } from '.';
import { server } from './RetentionCard.mocks';

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const { wrapper } = buildTestWrapper().withTheme().withReactQuery();

describe('RetentionCard', () => {
  it('shows the environment default and offers no way to change it', async () => {
    render(<RetentionCard />, { wrapper });

    expect(
      await screen.findByText('90 days', {}, { timeout: 15000 }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Set by DFE_CLICKHOUSE_DEFAULT_TTL_DAYS/),
    ).toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    expect(screen.queryByRole('spinbutton')).not.toBeInTheDocument();
  });

  it('shows a default of 0 as kept forever', async () => {
    server.use(
      API_CONFIG_MOCKS.system.retention.get.success({
        mockedResponse: { default_ttl_days: 0 },
      }),
    );

    render(<RetentionCard />, { wrapper });

    expect(
      await screen.findByText('none (kept forever)', {}, { timeout: 15000 }),
    ).toBeInTheDocument();
  });
});
