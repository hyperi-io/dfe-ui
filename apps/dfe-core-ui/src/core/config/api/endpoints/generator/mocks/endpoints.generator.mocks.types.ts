import { components } from '@repo/dfe-engine-types';

export type TValidationError = components['schemas']['Problem'];

export const DEFAULT_VALIDATION_ERROR: TValidationError = {
  type: 'about:blank',
  title: 'Unprocessable Content',
  status: 422,
  detail: '',
  code: 'validation_error',
  errors: [],
};
