export const oidc = {
  login: {
    mockedUrl: '/api/v1/auth/oidc/{provider}/login',
    get: {
      success: () => {
        console.error('Not implemented');
      },
    },
  },
  callback: {
    mockedUrl: '/api/v1/auth/oidc/{provider}/callback',
    get: {
      success: () => {
        console.error('Not implemented');
      },
    },
  },
};
