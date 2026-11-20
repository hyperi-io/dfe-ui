import { API_CONFIG_MOCKS } from '@/core/config/api/endpoints/generator';
import { buildTestWrapper } from '@/core/utils/test-utils/buildTestWrapper';
import { render, screen } from '@testing-library/react';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { AppOperationalCard } from '.';
import { COMPONENT, server } from './AppOperationalCard.mocks';

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const { wrapper } = buildTestWrapper().withTheme().withReactQuery();

const statusOf = (reporting: boolean | null) =>
  API_CONFIG_MOCKS.apps.status.get.success({
    ...COMPONENT,
    mockedResponse: {
      telemetry_name: 'dfe-ui',
      reporting,
      last_seen_epoch: null,
      started_epoch: null,
      uptime_seconds: null,
    },
  });

describe('AppOperationalCard reporting tag', () => {
  it.each([
    {
      reporting: true,
      shown: 'reporting',
      hidden: ['not reporting', 'no telemetry'],
    },
    {
      reporting: false,
      shown: 'not reporting',
      hidden: ['reporting', 'no telemetry'],
    },
    {
      reporting: null,
      shown: 'no telemetry',
      hidden: ['reporting', 'not reporting'],
    },
  ])(
    'reads reporting=$reporting as "$shown"',
    async ({ reporting, shown, hidden }) => {
      server.use(statusOf(reporting));

      render(<AppOperationalCard {...COMPONENT} />, { wrapper });

      expect(await screen.findByText(shown)).toBeInTheDocument();
      hidden.forEach((text) =>
        expect(screen.queryByText(text)).not.toBeInTheDocument(),
      );
    },
  );
});
