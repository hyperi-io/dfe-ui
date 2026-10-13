import { screen, within } from '@testing-library/react';
import type { UserEvent } from '@testing-library/user-event';

// Each source switch measured 2-4s in jsdom, and a drawer flow with two or three measured up to 19s, close to the 20s default.
export const SOURCE_SWITCH_TEST_TIMEOUT_MS = 60_000;

/** Picks where the credential labelled `label` comes from. */
export const chooseCredentialSource = async (
  user: UserEvent,
  label: string,
  source: 'Value' | 'Env Var',
) => {
  const combobox = screen.getByLabelText(`${label} source`);
  await user.click(combobox);

  const listId = combobox.getAttribute('aria-controls');
  const list = listId ? document.getElementById(listId) : null;
  if (!list) {
    throw new Error(`no option list for "${label} source"`);
  }
  await user.click(within(list).getByRole('option', { name: source }));
};
