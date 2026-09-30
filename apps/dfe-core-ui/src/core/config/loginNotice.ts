/** Query parameter naming a notice the login page shows above the form. */
export const LOGIN_NOTICE_PARAM = 'notice';

// The query carries a key, never text, so a crafted link cannot put words on the login page.
const LOGIN_NOTICES = {
  'password-changed': {
    title: 'Password changed',
    description: 'Sign in with your new password.',
  },
} as const;

export type TLoginNotice = keyof typeof LOGIN_NOTICES;

/** The login page, showing one notice. */
export const loginWithNotice = (notice: TLoginNotice): string =>
  `/login?${LOGIN_NOTICE_PARAM}=${notice}`;

/** The notice a query value names, or undefined for anything unknown. */
export const loginNotice = (
  value: string | undefined,
): (typeof LOGIN_NOTICES)[TLoginNotice] | undefined =>
  value !== undefined && Object.hasOwn(LOGIN_NOTICES, value)
    ? LOGIN_NOTICES[value as TLoginNotice]
    : undefined;
