import { components } from '@repo/dfe-engine-types';

export const DEFAULT_VALIDATION_ERROR: TValidationError = {
  loc: [],
  msg: '',
  type: '',
  input: undefined,
  ctx: undefined,
};

export type TValidationError = components['schemas']['ValidationError'];
