import { buildTestWrapper } from '@/core/utils/test-utils/buildTestWrapper';
import {
  MOCK_SOURCE_NAME,
  server,
} from '@/Sources/hooks/useFetchInfiniteSourceColumns/useFetchInfiniteSourceColumns.mocks';
import { render, screen } from '@testing-library/react';
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
});
