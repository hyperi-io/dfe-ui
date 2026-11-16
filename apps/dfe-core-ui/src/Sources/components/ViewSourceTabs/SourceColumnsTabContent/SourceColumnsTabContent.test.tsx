import { buildTestWrapper } from '@/core/utils/test-utils/buildTestWrapper';
import { API_CONFIG_MOCKS } from '@/core/config/api/endpoints/generator';
import {
  MOCK_SOURCE_NAME,
  server,
} from '@/Sources/hooks/useFetchInfiniteSourceColumns/useFetchInfiniteSourceColumns.mocks';
import { render, screen } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { SourceColumnsTabContent } from '.';

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const { wrapper } = buildTestWrapper().withTheme().withReactQuery();

describe('SourceColumnsTabContent', () => {
  it('shows each column cardinality beside its attributes', async () => {
    render(<SourceColumnsTabContent source_name={MOCK_SOURCE_NAME} />, {
      wrapper,
    });

    expect((await screen.findAllByText('Cardinality')).length).toBeGreaterThan(
      0,
    );
    expect((await screen.findAllByText('low')).length).toBeGreaterThan(0);
  });

  it('shows each attribute as its own badge', async () => {
    server.use(
      http.get(
        API_CONFIG_MOCKS.sources.sourceColumns.mockedUrl.replace(
          '{name}',
          MOCK_SOURCE_NAME,
        ),
        () =>
          HttpResponse.json({
            items: [
              {
                name: 'host',
                type: 'String',
                use_case: 'none',
                attribute: ['lowcardinality', 'not_null'],
                cardinality: 'low',
                description: '',
              },
            ],
            next_page_token: null,
            total_size: 1,
          }),
      ),
    );
    render(<SourceColumnsTabContent source_name={MOCK_SOURCE_NAME} />, {
      wrapper,
    });

    expect(await screen.findByText('lowcardinality')).toBeInTheDocument();
    expect(screen.getByText('not_null')).toBeInTheDocument();
    expect(
      screen.queryByText('lowcardinalitynot_null'),
    ).not.toBeInTheDocument();
  });
});
