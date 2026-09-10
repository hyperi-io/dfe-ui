import { API_CONFIG_MOCKS } from '@/core/config/api/endpoints/generator';
import { buildTestWrapper } from '@/core/utils/test-utils/buildTestWrapper';
import { render, screen } from '@testing-library/react';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { SourceFlowCard } from '.';
import { server } from './SourceFlowCard.mocks';

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const { wrapper } = buildTestWrapper().withTheme().withReactQuery();

describe('SourceFlowCard', () => {
  it('draws the three stages a record travels', async () => {
    render(<SourceFlowCard source="source" />, { wrapper });

    expect(await screen.findByText('Input')).toBeInTheDocument();
    expect(screen.getByText('Transform')).toBeInTheDocument();
    expect(screen.getByText('Output')).toBeInTheDocument();
    expect(
      screen.getByText('Receiver match: tags.collector.type equals source'),
    ).toBeInTheDocument();
    expect(screen.getByText('dfe-transform-vrl-source')).toBeInTheDocument();
  });

  it('shows the engine as the owner of a derived stage', async () => {
    render(<SourceFlowCard source="source" />, { wrapper });

    expect(await screen.findByText('engine-owned')).toBeInTheDocument();
  });

  it('shows a refused flow in the engine own words', async () => {
    server.use(
      API_CONFIG_MOCKS.sources.sourceFlow.get.error({
        mockedResponse: {
          code: 'flow_error',
          message:
            "source 'source' is on the direct transport, but dfe-archiver carries only bus",
        },
      }),
    );

    render(<SourceFlowCard source="source" />, { wrapper });

    expect(
      await screen.findByText(/dfe-archiver carries only bus/),
    ).toBeInTheDocument();
    expect(screen.queryByText('Input')).not.toBeInTheDocument();
  });
});
