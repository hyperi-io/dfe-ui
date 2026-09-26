import { signOut } from 'next-auth/react';

interface UseLogoutOptions {
  /** Where the browser lands after sign-out. Unset, next-auth returns it to the current page. */
  callbackUrl?: string;
}

export const useLogout = ({ callbackUrl }: UseLogoutOptions = {}) => {
  return {
    handleLogout: () => {
      signOut(callbackUrl ? { callbackUrl } : undefined);
    },
  };
};
