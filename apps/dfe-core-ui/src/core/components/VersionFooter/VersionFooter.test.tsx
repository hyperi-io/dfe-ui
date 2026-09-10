import { API_CONFIG_MOCKS } from '@/core/config/api/endpoints/generator';
import { buildTestWrapper } from '@/core/utils/test-utils/buildTestWrapper';
import { render, screen } from '@testing-library/react';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { VersionFooter } from '.';
import { server } from './VersionFooter.mocks';

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const { wrapper } = buildTestWrapper().withTheme().withReactQuery();

const renderFooter = () => render(<VersionFooter />, { wrapper });

describe('VersionFooter', () => {
  // The ui pin is written as a digest-pinned container ref, so the tooltip has to
  // read as a version rather than repeat the tag verbatim.
  it('shows the stack version, with the parts it resolves to on hover', async () => {
    server.use(
      API_CONFIG_MOCKS.system.version.get.success({
        mockedResponse: {
          stack: '2.2.0-rc.13',
          engine: '1.19.12',
          ui: 'v1.20.0@sha256:abc',
          source: 'deploy-repo',
          python_version: '3.12.12',
        },
      }),
    );

    renderFooter();

    const footer = await screen.findByText('2.2.0-rc.13');
    expect(footer).toHaveAttribute(
      'title',
      '2.2.0-rc.13 | engine v1.19.12 | ui v1.20.0',
    );
  });

  // Without a deploy repo there is no stack to name, so the engine is the answer.
  it('falls back to the engine version when nothing pins a stack', async () => {
    server.use(
      API_CONFIG_MOCKS.system.version.get.success({
        mockedResponse: {
          stack: null,
          engine: '1.19.12',
          ui: null,
          source: 'engine',
          python_version: '3.12.12',
        },
      }),
    );

    renderFooter();

    const footer = await screen.findByText('engine v1.19.12');
    expect(footer).toHaveAttribute('title', 'engine v1.19.12');
  });
});
