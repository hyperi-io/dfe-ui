import { apiClient } from '@/core/config/api';
import { API_CONFIG } from '@/core/config/api/endpoints';

const availabilityPath = API_CONFIG.accounts.availability;

/** Why the engine would refuse a new account this username or email, empty where it would not. */
const accountAvailability = async (query: {
  email?: string;
  username?: string;
}) => {
  try {
    return await apiClient.get(availabilityPath, { queryParams: query });
  } catch {
    // An engine that cannot answer refuses nothing here, and the create reports the clash.
    return { email: '', username: '' };
  }
};

/** A form rule refusing a username another account already takes, as the engine judges it. */
export const usernameAvailableRule = {
  validator: async (_: unknown, value: unknown) => {
    if (typeof value !== 'string' || !value) {
      return;
    }
    const { username } = await accountAvailability({ username: value });
    if (username) {
      throw new Error(username);
    }
  },
};

/** A form rule refusing an email another account a sign-in could link to already holds. */
export const emailAvailableRule = {
  validator: async (_: unknown, value: unknown) => {
    if (typeof value !== 'string' || !value.trim()) {
      return;
    }
    const { email } = await accountAvailability({ email: value });
    if (email) {
      throw new Error(email);
    }
  },
};
