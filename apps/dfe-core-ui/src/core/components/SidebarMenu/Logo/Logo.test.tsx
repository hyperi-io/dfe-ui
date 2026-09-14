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

  it('starts the wordmark at the nav group headers left gutter when expanded', () => {
    render(<Logo collapsed={false} colorMode="light" />);

    const wordmark = screen.getByAltText('DFE');
    const link = wordmark.closest('a');

    expect(link?.className).toContain('items-start');
    expect(link?.className).toContain('pl-8');
    expect(link?.className).not.toContain('items-end');
  });

  it('left-aligns the caption under the wordmark', () => {
    render(<Logo collapsed={false} colorMode="light" />);

    const caption = screen.getByText('Data Fusion Engine');

    expect(caption.className).toContain('text-left');
    expect(caption.className).not.toContain('text-center');
  });

  it('keeps the collapsed mark centred on the rail', () => {
    render(<Logo collapsed={true} colorMode="light" />);

    const link = screen.getByRole('link');

    expect(link.className).toContain('mx-auto');
    expect(link.className).toContain('justify-center');
  });
});
