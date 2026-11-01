import { buildTestWrapper } from '@/core/utils/test-utils/buildTestWrapper';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { SourceEnabledTag } from './SourceEnabledTag';

const PR = 'https://github.com/acme/deploy/pull/7';
const server = setupServer();
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const { wrapper } = buildTestWrapper().withTheme().withReactQuery();

const clickDisable = async () => {
  const user = userEvent.setup();
  render(<SourceEnabledTag enabled sourceName="okta" />, { wrapper });
  await user.click(await screen.findByRole('button', { name: 'Enabled' }));
  await user.click(
    await screen.findByRole('button', { name: 'Disable Source' }),
  );
};

describe('SourceEnabledTag', () => {
  it('keeps the tag as it was and says the change awaits review', async () => {
    server.use(
      http.patch('/api/v1/sources/okta', () =>
        HttpResponse.json({
          source: 'okta',
          current: '1.0.0',
          review_required: true,
          pr_url: PR,
        }),
      ),
    );

    await clickDisable();

    expect(
      await screen.findByText(
        'The change to disable okta is awaiting review. The source stays enabled until it is merged.',
        {},
        { timeout: 5000 },
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'Open the review request' }),
    ).toHaveAttribute('href', PR);
    expect(screen.getByRole('button', { name: 'Enabled' })).toBeInTheDocument();
  });

  it('closes the menu when the change was applied', async () => {
    server.use(
      http.patch('/api/v1/sources/okta', () =>
        HttpResponse.json({
          source: 'okta',
          current: '1.0.0',
          review_required: false,
        }),
      ),
    );

    await clickDisable();

    await expect(
      screen.findByText(/awaiting review/, {}, { timeout: 1500 }),
    ).rejects.toThrow();
  });
});
