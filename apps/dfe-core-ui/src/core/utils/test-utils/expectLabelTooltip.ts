/* import-scope-drift-disable - (exported for tests) */
import { screen } from '@testing-library/react';
import type { UserEvent } from '@testing-library/user-event';
import { expect } from 'vitest';

/** Hovers the tooltip icon on the form label `label` and waits for `text`, which shows only on hover. */
export const expectLabelTooltip = async (
  user: UserEvent,
  label: string,
  text: string,
) => {
  const icon = screen
    .getByText(label, { selector: 'label' })
    .querySelector('.ant-form-item-tooltip');
  expect(icon).not.toBeNull();
  await user.hover(icon as Element);
  expect(await screen.findByText(text)).toBeInTheDocument();
};
/* import-scope-drift-enable */
