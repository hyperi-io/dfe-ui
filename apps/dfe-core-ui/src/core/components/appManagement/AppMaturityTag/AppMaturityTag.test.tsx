import { buildTestWrapper } from '@/core/utils/test-utils/buildTestWrapper';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { AppMaturityTag } from '.';

const { wrapper } = buildTestWrapper().withTheme();

describe('AppMaturityTag', () => {
  it('renders nothing for a release-grade app', () => {
    const { container } = render(<AppMaturityTag maturity="release" />, {
      wrapper,
    });

    expect(container).toBeEmptyDOMElement();
  });

  it.each(['alpha', 'beta', 'rc'] as const)('names a %s app', (maturity) => {
    render(<AppMaturityTag maturity={maturity} />, { wrapper });

    expect(screen.getByText(maturity)).toBeInTheDocument();
  });
});
