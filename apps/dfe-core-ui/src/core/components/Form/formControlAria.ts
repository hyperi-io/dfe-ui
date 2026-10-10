import type { AriaAttributes } from 'react';

/**
 * The aria props Form.Item sets on its direct child. A custom control forwards
 * them to the element that takes focus, or the error and hint reach no one.
 */
export type FormControlAria = Pick<
  AriaAttributes,
  'aria-describedby' | 'aria-invalid' | 'aria-required'
>;
