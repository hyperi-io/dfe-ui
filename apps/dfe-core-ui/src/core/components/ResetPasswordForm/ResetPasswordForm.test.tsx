import { ApiError } from '@/core/config/api/client';
import { buildTestWrapper } from '@/core/utils/test-utils/buildTestWrapper';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, test, vi } from 'vitest';
import { ResetPasswordForm } from '.';

const { wrapper } = buildTestWrapper().withTheme();

const FLOOR_MESSAGE = 'Password must contain at least 12 characters';
// 72 characters and 73 bytes: the accented letter takes two.
const SEVENTY_THREE_BYTES = `${'a'.repeat(71)}${String.fromCodePoint(0xe9)}`;
const BYTES_MESSAGE =
  'Use at most 72 bytes. Most characters count as 1, but accented letters, other scripts and emoji count as 2 to 4.';
const MISMATCH_MESSAGE = 'Passwords do not match';

describe('ResetPasswordForm', () => {
  // Confirm checks only that it matches, so each refusal is reported once, on
  // the field that caused it, and announced as it appears.
  test.each([
    {
      case: 'an 11-character password',
      newValue: 'eleven-char',
      confirmValue: 'eleven-char',
      field: 'New Password',
      message: FLOOR_MESSAGE,
    },
    {
      case: 'a 73-byte password',
      newValue: SEVENTY_THREE_BYTES,
      confirmValue: SEVENTY_THREE_BYTES,
      field: 'New Password',
      message: BYTES_MESSAGE,
    },
    {
      case: 'a valid password with a shorter confirmation',
      newValue: 'a-new-password!',
      confirmValue: 'short',
      field: 'Confirm Password',
      message: MISMATCH_MESSAGE,
    },
    {
      case: 'a valid password with no confirmation',
      newValue: 'a-new-password!',
      confirmValue: '',
      field: 'Confirm Password',
      message: MISMATCH_MESSAGE,
    },
  ])(
    'refuses $case once, on $field, without submitting',
    async ({ newValue, confirmValue, field, message }) => {
      const onFinish = vi.fn();
      const user = userEvent.setup();
      render(<ResetPasswordForm onFinish={onFinish} />, { wrapper });

      await user.click(screen.getByLabelText('New Password'));
      await user.paste(newValue);
      if (confirmValue) {
        await user.click(screen.getByLabelText('Confirm Password'));
        await user.paste(confirmValue);
      }
      await user.click(screen.getByRole('button', { name: 'Reset Password' }));

      const alert = await screen.findByRole('alert');
      expect(alert).toHaveTextContent(message);
      expect(screen.getAllByText(message)).toHaveLength(1);
      expect(screen.getByLabelText(field)).toHaveAttribute(
        'aria-invalid',
        'true',
      );
      expect(screen.getByLabelText(field)).toHaveAccessibleDescription(message);
      const other =
        field === 'New Password' ? 'Confirm Password' : 'New Password';
      expect(screen.getByLabelText(other)).not.toHaveAttribute(
        'aria-invalid',
        'true',
      );
      expect(onFinish).not.toHaveBeenCalled();
    },
  );

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

  test('an admin reset of another account asks for no current password', () => {
    render(<ResetPasswordForm />, { wrapper });

    expect(screen.queryByLabelText('Current Password')).not.toBeInTheDocument();
  });

  test('a self change will not submit without the current password', async () => {
    const onFinish = vi.fn();
    const user = userEvent.setup();
    render(<ResetPasswordForm askCurrentPassword onFinish={onFinish} />, {
      wrapper,
    });

    await user.type(screen.getByLabelText('New Password'), 'a-new-password!');
    await user.type(
      screen.getByLabelText('Confirm Password'),
      'a-new-password!',
    );
    await user.click(screen.getByRole('button', { name: 'Reset Password' }));

    expect(
      await screen.findByText('Enter your current password'),
    ).toBeInTheDocument();
    expect(onFinish).not.toHaveBeenCalled();
  });

  test('a self change hands the current password on with the new one', async () => {
    const onFinish = vi.fn();
    const user = userEvent.setup();
    render(<ResetPasswordForm askCurrentPassword onFinish={onFinish} />, {
      wrapper,
    });

    await user.type(screen.getByLabelText('Current Password'), 'the-old-one');
    await user.type(screen.getByLabelText('New Password'), 'a-new-password!');
    await user.type(
      screen.getByLabelText('Confirm Password'),
      'a-new-password!',
    );
    await user.click(screen.getByRole('button', { name: 'Reset Password' }));

    await vi.waitFor(() =>
      expect(onFinish).toHaveBeenCalledWith({
        current_password: 'the-old-one',
        new_password: 'a-new-password!',
        confirm_password: 'a-new-password!',
      }),
    );
  });

  test('a wrong current password is marked on that field, not as a banner', () => {
    const error = new ApiError(403, 'Forbidden', {
      code: 'invalid_current_password',
      message: "That is not this account's current password.",
    });

    render(<ResetPasswordForm askCurrentPassword error={error} />, {
      wrapper,
    });

    expect(
      screen.getByText('That is not your current password.'),
    ).toBeInTheDocument();
    expect(
      screen.queryByText("That is not this account's current password."),
    ).not.toBeInTheDocument();
  });

  test('too many attempts shows the wait the engine gave', () => {
    const error = new ApiError(429, 'Too Many Requests', {
      code: 'too_many_attempts',
      message: 'Too many failed attempts; try again in 30 seconds',
    });

    render(<ResetPasswordForm askCurrentPassword error={error} />, {
      wrapper,
    });

    expect(
      screen.getByText('Too many failed attempts; try again in 30 seconds'),
    ).toBeInTheDocument();
  });
});
