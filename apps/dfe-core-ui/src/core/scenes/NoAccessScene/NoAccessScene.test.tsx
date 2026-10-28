import { render, screen } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import { NoAccessScene } from '.';

vi.mock('@/core/components/SettingsActionButton', () => ({
  SettingsActionButton: () => <button type="button">settings</button>,
}));

describe('dark mode', () => {
  test('the card and the logo carry a dark pair, so the copy stays readable', () => {
    render(<NoAccessScene />);

    const card = screen.getByRole('heading', {
      name: 'You do not have access to DFE',
    }).parentElement;
    expect(card).toHaveClass(
      'bg-background',
      'dark:bg-dark-background',
      'text-foreground',
      'dark:text-dark-foreground',
    );
    expect(card?.querySelector('svg')).toHaveClass('dark:text-white');
  });
});
