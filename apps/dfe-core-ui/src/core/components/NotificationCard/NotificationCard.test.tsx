import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { NotificationCard } from '.';

const root = () =>
  screen.getByRole('heading', { level: 3 }).closest('div.rounded-lg');

describe('NotificationCard', () => {
  it.each([
    'default',
    'warning',
    'error',
    'info',
    'action',
    'success',
  ] as const)('quiets a subtle %s card without fading its text', (type) => {
    render(<NotificationCard type={type} variant="subtle" title="Quiet" />);

    expect(root()?.className).not.toMatch(/(^|\s)opacity-/);
  });

  it('keeps the default variant at full strength', () => {
    render(<NotificationCard type="info" title="Loud" />);

    expect(root()?.className).not.toMatch(/(^|\s)opacity-/);
  });
});
