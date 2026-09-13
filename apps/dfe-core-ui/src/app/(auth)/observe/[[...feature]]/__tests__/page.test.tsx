import ObservePage from '@/app/(auth)/observe/[[...feature]]/page';
import { buildTestWrapper } from '@/core/utils/test-utils/buildTestWrapper';
import { render, screen } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';

// The page reads the catch-all segment and the query string to build the
// iframe src; neither matters for the attribution caption below.
vi.mock('next/navigation', () => ({
  useParams: () => ({ feature: undefined }),
  useSearchParams: () => new URLSearchParams(),
}));

const { wrapper } = buildTestWrapper().withTheme().withHyperdxPort('8090');

describe('ObservePage', () => {
  // dfe-ui ships none of HyperDX's code -- this caption is the one place the
  // running app credits it, so it must survive as a link, not just text.
  test('credits HyperDX with a link to the upstream project', () => {
    render(<ObservePage />, { wrapper });

    expect(screen.getByText(/Explore is powered by/)).toBeTruthy();

    const link = screen.getByRole('link', { name: 'HyperDX' });
    expect(link).toHaveAttribute(
      'href',
      'https://github.com/hyperdxio/hyperdx',
    );
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });
});
