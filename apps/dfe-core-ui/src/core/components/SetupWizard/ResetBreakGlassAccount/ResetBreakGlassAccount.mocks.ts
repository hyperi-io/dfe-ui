import { API_CONFIG_MOCKS } from '@/core/config/api/endpoints/generator';
import { setupServer } from 'msw/node';

export const server = setupServer(
  // The literal, not the product's own constant: sharing the constant is what
  // let the app and its tests agree on a wrong value in dfe-ui#206.
  API_CONFIG_MOCKS.accounts.resetPassword.post.success({
    username: 'breakglass',
  }),
  API_CONFIG_MOCKS.auth.setupStatus.get.success(),
);
