import { API_CONFIG_MOCKS } from '@/core/config/api/endpoints/generator';
import { buildTestWrapper } from '@/core/utils/test-utils/buildTestWrapper';
import { server } from '@/core/components/RbacProtected/hooks/hooks.mocks';
import { render, screen } from '@testing-library/react';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { ClickhouseCloudStatus } from '.';

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const { wrapper } = buildTestWrapper().withTheme().withReactQuery();

const BASE = { id: '', name: '', state: '', is_running: false };

describe('ClickhouseCloudStatus', () => {
  it.each([
    {
      name: 'not configured (self-hosted ClickHouse)',
      status: { ...BASE, configured: false },
      runningRow: false,
      redIcon: false,
    },
    {
      name: 'configured and stopped',
      status: { ...BASE, configured: true, id: 'svc', name: 'prod' },
      runningRow: true,
      redIcon: true,
    },
    {
      name: 'configured and running',
      status: {
        ...BASE,
        configured: true,
        is_running: true,
        id: 'svc',
        name: 'prod',
      },
      runningRow: true,
      redIcon: false,
    },
  ])('$name', async ({ status, runningRow, redIcon }) => {
    server.use(
      API_CONFIG_MOCKS.system.clickhouseCloud.get.success({
        mockedResponse: status,
      }),
    );
    const { container } = render(<ClickhouseCloudStatus />, { wrapper });

    expect(await screen.findByText('Configured:')).toBeInTheDocument();
    expect(screen.queryByText('Is Running:') !== null).toBe(runningRow);
    expect(container.querySelector('.text-red-500') !== null).toBe(redIcon);
  });
});
