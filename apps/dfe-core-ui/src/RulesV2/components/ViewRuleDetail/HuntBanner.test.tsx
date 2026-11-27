import { API_CONFIG_MOCKS } from '@/core/config/api/endpoints/generator';
import { buildTestWrapper } from '@/core/utils/test-utils/buildTestWrapper';
import { render, screen } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll, describe, expect, test } from 'vitest';
import { HuntBanner } from './HuntBanner';

const server = setupServer();
const { wrapper } = buildTestWrapper().withTheme().withReactQuery();

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const huntsPage = (count: number) => ({
  items: Array.from({ length: count }, (_, i) => ({ name: `hunt_${i}` })),
  total_size: count,
  next_page_token: null,
});

describe('HuntBanner', () => {
  test.each([
    [1, '1 hunt is associated with this rule:'],
    [2, '2 hunts are associated with this rule:'],
  ])('names %i hunts in its title', async (count, title) => {
    server.use(
      http.get(API_CONFIG_MOCKS.hunts.default.mockedUrl, () =>
        HttpResponse.json(huntsPage(count)),
      ),
    );

    render(<HuntBanner ruleName="brute_force" />, { wrapper });

    expect(await screen.findByText(title)).toBeInTheDocument();
  });

  test('warns when no hunt runs the rule', async () => {
    server.use(
      http.get(API_CONFIG_MOCKS.hunts.default.mockedUrl, () =>
        HttpResponse.json(huntsPage(0)),
      ),
    );

    render(<HuntBanner ruleName="brute_force" />, { wrapper });

    expect(
      await screen.findByText('No hunts associated with this rule'),
    ).toBeInTheDocument();
  });
});
