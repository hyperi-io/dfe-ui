import { ApiError } from '@/core/config/api/client';
import { buildTestWrapper } from '@/core/utils/test-utils/buildTestWrapper';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, test, vi } from 'vitest';
import { ResetPasswordForm } from '.';

const { wrapper } = buildTestWrapper().withTheme();

const FLOOR_MESSAGE = 'Password must contain at least 12 characters';

describe('ResetPasswordForm', () => {
  test('refuses an 11-character password without submitting', async () => {
    const onFinish = vi.fn();
    const user = userEvent.setup();
    render(<ResetPasswordForm onFinish={onFinish} />, { wrapper });

    await user.type(screen.getByLabelText('New Password'), 'eleven-char');
    await user.type(screen.getByLabelText('Confirm Password'), 'eleven-char');
    await user.click(screen.getByRole('button', { name: 'Reset Password' }));

    expect(await screen.findAllByText(FLOOR_MESSAGE)).toHaveLength(2);
    expect(onFinish).not.toHaveBeenCalled();
  });

  test('names the refused field when the engine answers 422', () => {
    const error = new ApiError(422, 'Unprocessable Entity', {
      code: 'validation_error',
      message: '1 validation error(s)',
      errors: [
        {
          field: 'new_password',
          message: 'String should have at least 12 characters',
          code: 'string_too_short',
        },
      ],
    });

    render(<ResetPasswordForm error={error} />, { wrapper });

    expect(
      screen.getByText(
        'new_password: String should have at least 12 characters',
      ),
    ).toBeInTheDocument();
  });
});
