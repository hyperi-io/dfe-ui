import { render, screen } from '@testing-library/react';
import { describe, expect, test } from 'vitest';
import { ProviderBadge } from '.';

describe('ProviderBadge', () => {
  test.each([
    { type: 'google', expected: 'G' },
    { type: 'entra_id', expected: 'E' },
    { type: 'okta', expected: 'O' },
    { type: 'generic', expected: '' },
    { type: '', expected: '' },
    { type: 'github', expected: '' },
  ])('names $type with "$expected"', ({ expected, type }) => {
    render(<ProviderBadge label="Signs in through corp" type={type} />);
    expect(
      screen.getByRole('img', { name: 'Signs in through corp' }),
    ).toHaveTextContent(expected, { normalizeWhitespace: true });
  });

  test.each(['generic', '', 'github'])(
    'draws a key for the %s type',
    (type) => {
      const { container } = render(
        <ProviderBadge label="Signs in through corp" type={type} />,
      );
      expect(container.querySelector('svg')).toBeInTheDocument();
    },
  );

  test('hides an unlabelled badge from assistive tech', () => {
    render(<ProviderBadge type="okta" />);
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });
});
