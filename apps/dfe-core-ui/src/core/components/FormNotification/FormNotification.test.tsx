import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { FormNotification } from '.';

describe('FormNotification role', () => {
  it.each([
    { type: 'error', role: 'alert' },
    { type: 'warning', role: 'alert' },
    { type: 'success', role: 'status' },
    { type: 'info', role: 'status' },
    { type: 'default', role: 'status' },
    { type: undefined, role: 'status' },
  ] as const)('a $type notice is a live $role', ({ type, role }) => {
    render(<FormNotification type={type} title="Heads up" text="Body" />);

    const notice = screen.getByRole(role);
    expect(notice).toHaveTextContent('Heads up');
    expect(notice).toHaveTextContent('Body');
  });

  it('keeps an empty notice live so later text is still read out', () => {
    render(<FormNotification type="error" text="" />);

    expect(screen.getByRole('alert')).toBeEmptyDOMElement();
  });
});
