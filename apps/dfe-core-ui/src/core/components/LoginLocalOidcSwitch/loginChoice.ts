import {
  readStorageJson,
  removeStorageItem,
  writeStorageItem,
} from '@/core/utils/storage';

const LOGIN_CHOICE_KEY = 'dfe_login_choice';

export const REMEMBER_LABEL = 'Remember my selection';

/** How the user last asked to sign in: the local form, or an OIDC provider by name. */
export type TLoginChoice =
  { method: 'local' } | { method: 'oidc'; provider: string };

const isLoginChoice = (value: unknown): value is TLoginChoice =>
  typeof value === 'object' &&
  value !== null &&
  'method' in value &&
  (value.method === 'local' ||
    (value.method === 'oidc' &&
      'provider' in value &&
      typeof value.provider === 'string' &&
      value.provider !== ''));

/** The remembered sign-in choice, or null when there is none or storage is unusable. */
export const readLoginChoice = (): TLoginChoice | null =>
  readStorageJson(LOGIN_CHOICE_KEY, isLoginChoice);

/** Remember `choice` for the next visit, or forget the remembered one when it is null. */
export const rememberLoginChoice = (choice: TLoginChoice | null): void => {
  if (choice) {
    writeStorageItem(LOGIN_CHOICE_KEY, JSON.stringify(choice));
  } else {
    removeStorageItem(LOGIN_CHOICE_KEY);
  }
};
