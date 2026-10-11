/** What the login page says about a sign-in the engine refused. */
export type TLoginRefusal = { title: string; description: string };

// The engine hands back a code, never text, so a crafted link cannot put words on the login page.
const LOGIN_REFUSALS: Record<string, TLoginRefusal> = {
  no_role_granted: {
    title: 'No access to DFE yet',
    description:
      'You signed in, but none of your identity provider groups is linked to a DFE role. Ask a DFE administrator to link one. To sign in as someone else, sign out of your identity provider first.',
  },
  account_disabled: {
    title: 'Account disabled',
    description:
      'Your DFE account is disabled. Ask a DFE administrator to enable it.',
  },
  account_blocked: {
    title: 'Account blocked',
    description:
      'Your DFE account is blocked. Ask a DFE administrator to unblock it.',
  },
  service_unavailable: {
    title: 'Sign-in not recorded',
    description: 'DFE could not record the sign-in. Try again in a moment.',
  },
};

const UNRECOGNISED_REFUSAL: TLoginRefusal = {
  title: 'Sign-in failed',
  description:
    'DFE did not accept the sign-in from your identity provider. Try again, or ask a DFE administrator to check the engine log.',
};

/** The words for a refusal code; any code without its own words gets the general failure. */
export const loginRefusal = (code: string): TLoginRefusal =>
  Object.hasOwn(LOGIN_REFUSALS, code)
    ? (LOGIN_REFUSALS[code] ?? UNRECOGNISED_REFUSAL)
    : UNRECOGNISED_REFUSAL;
