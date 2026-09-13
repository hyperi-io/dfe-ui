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

  it('renders the caption inside the same box as the wordmark image, so it can never be wider', () => {
    render(<Logo collapsed={false} colorMode="light" />);

    const wordmark = screen.getByAltText('DFE');
    const caption = screen.getByText('Data Fusion Engine');

    expect(wordmark.parentElement).toBe(caption.parentElement);
    expect(caption.parentElement?.className).toContain('inline-block');
    expect(caption.className).toContain('w-full');
  });
});
