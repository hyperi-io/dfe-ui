import { screen } from '@testing-library/react';
import type { UserEvent } from '@testing-library/user-event';

/** Answer the "Confirm it's you" prompt a change asks for, with a password the re-auth mock accepts. */
export const confirmReauth = async (user: UserEvent) => {
  await user.type(
    await screen.findByLabelText('Your password', undefined, {
      timeout: 15_000,
    }),
    'pw',
  );
  await user.click(
    screen.getByRole('button', { hidden: true, name: 'Confirm' }),
  );
};
