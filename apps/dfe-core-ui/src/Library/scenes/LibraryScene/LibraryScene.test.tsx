import { API_CONFIG_MOCKS } from '@/core/config/api/endpoints/generator';
import { buildTestWrapper } from '@/core/utils/test-utils/buildTestWrapper';
import { render, screen } from '@testing-library/react';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { LibraryScene } from '.';
import { server } from './LibraryScene.mocks';

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const { wrapper } = buildTestWrapper().withTheme().withReactQuery();

describe('LibraryScene', () => {
  it('lists an artefact with its kind, group and current version', async () => {
    render(<LibraryScene />, { wrapper });

    expect(
      await screen.findByRole(
        'button',
        { name: 'syslog-parse' },
        { timeout: 15_000 },
      ),
    ).toBeInTheDocument();
    expect(screen.getByText('vrl')).toBeInTheDocument();
    expect(screen.getByText('network')).toBeInTheDocument();
  });

  it('shows tags and labels apart, because they mean different things', async () => {
    render(<LibraryScene />, { wrapper });

    expect(
      await screen.findByText('stable -> 2', {}, { timeout: 15_000 }),
    ).toBeInTheDocument();
    expect(screen.getByText('team=platform')).toBeInTheDocument();
  });

  it('offers the classifying filters, not tag filters', async () => {
    render(<LibraryScene />, { wrapper });

    expect(
      await screen.findByText('Any kind', {}, { timeout: 15_000 }),
    ).toBeInTheDocument();
    expect(screen.getByText('Any state')).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText('Search name or description'),
    ).toBeInTheDocument();
    expect(screen.queryByText('Any tag')).not.toBeInTheDocument();
  });

  it('reports a failure to read the library rather than showing it empty', async () => {
    server.use(API_CONFIG_MOCKS.library.default.get.error());

    render(<LibraryScene />, { wrapper });

    expect(
      await screen.findByText(
        'Could not read the library',
        {},
        {
          timeout: 15_000,
        },
      ),
    ).toBeInTheDocument();
  });
});
