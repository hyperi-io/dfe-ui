import { screen, within } from '@testing-library/react';
import type { UserEvent } from '@testing-library/user-event';

/** Picks `option` in the select labelled `label`, looking only in that select's own option list. */
export const chooseOption = async (
  user: UserEvent,
  label: string,
  option: string,
) => {
  const combobox = screen.getByLabelText(label);
  await user.click(combobox);

  const listId = combobox.getAttribute('aria-controls');
  const list = listId ? document.getElementById(listId) : null;
  if (!list) {
    throw new Error(`no option list for "${label}"`);
  }
  await user.click(within(list).getByRole('option', { name: option }));
};

/** Replaces the text of the input labelled `label`. */
export const fillField = async (
  user: UserEvent,
  label: string,
  value: string,
) => {
  await user.clear(screen.getByLabelText(label));
  await user.paste(value);
};
