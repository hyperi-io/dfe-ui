import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Logo } from '.';

describe('Logo', () => {
  it('shows the brand caption under the wordmark when expanded', () => {
    render(<Logo collapsed={false} colorMode="light" />);

    expect(screen.getByText('Data Fusion Engine')).toBeInTheDocument();
  });

  it('hides the caption, and the wordmark, on a collapsed rail', () => {
    render(<Logo collapsed={true} colorMode="light" />);

    expect(screen.queryByText('Data Fusion Engine')).not.toBeInTheDocument();
  });
});
