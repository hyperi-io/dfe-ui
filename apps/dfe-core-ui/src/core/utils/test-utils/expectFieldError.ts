/* import-scope-drift-disable - (exported for tests) */
import { screen, waitFor } from '@testing-library/react';
import { expect } from 'vitest';

/** Waits for `message` in the form item around the input labelled `label`, the place a user reads it, and checks that item is not hidden. */
export const expectFieldError = async (label: string, message: string) => {
  const item = screen.getByLabelText(label).closest('.ant-form-item');
  expect(item).not.toBeNull();
  expect(item).not.toHaveClass('ant-form-item-hidden');
  await waitFor(() => expect(item).toHaveTextContent(message));
};
/* import-scope-drift-enable */
