export const apiKeys = {
  default: {
    mockedUrl: '/api/v1/auth/api-keys',
    get: {
      success: () => {
        return console.error('Not implemented');
      },
    },
  },
  apiKey: {
    mockedUrl: '/api/v1/auth/api-keys/{short_token}',
    get: {
      success: () => {
        return console.error('Not implemented');
      },
    },
  },
};
