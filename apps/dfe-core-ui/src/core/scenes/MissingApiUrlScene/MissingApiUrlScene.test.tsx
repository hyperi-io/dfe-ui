import { render, screen } from '@testing-library/react';
import { describe, expect, test } from 'vitest';
import { MissingApiUrlScene } from '.';

describe('MissingApiUrlScene', () => {
  test('says the console is not configured, and names the two variables', () => {
    const { container } = render(<MissingApiUrlScene />);

    expect(
      screen.getByRole('heading', { name: 'The engine URL is not configured' }),
    ).toBeInTheDocument();
    expect(container).toHaveTextContent(
      'Neither INTERNAL_API_URL nor NEXT_PUBLIC_API_URL is set.',
    );
  });

  test('offers no retry, since a reload cannot set an environment variable', () => {
    render(<MissingApiUrlScene />);

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});
