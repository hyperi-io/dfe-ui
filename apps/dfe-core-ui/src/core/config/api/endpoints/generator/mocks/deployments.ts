export const deployments = {
  default: {
    mockedUrl: '/api/v1/deployments',
    get: {
      success: () => {
        console.error('Not implemented');
      },
    },
  },
  deployment: {
    mockedUrl: '/api/v1/deployments/{service}/{instance}',
    get: {
      success: () => {
        console.error('Not implemented');
      },
    },
    put: {
      success: () => {
        console.error('Not implemented');
      },
    },
    delete: {
      success: () => {
        console.error('Not implemented');
      },
    },
  },
  validate: {
    mockedUrl: '/api/v1/deployments/{service}/{instance}/validate',
    post: {
      success: () => {
        console.error('Not implemented');
      },
    },
  },
  history: {
    mockedUrl: '/api/v1/deployments/{service}/{instance}/history',
    get: {
      success: () => {
        console.error('Not implemented');
      },
    },
  },
  applySize: {
    mockedUrl: '/api/v1/deployments/{service}/{instance}/size/{size}',
    post: {
      success: () => {
        console.error('Not implemented');
      },
    },
  },
  seed: {
    mockedUrl: '/api/v1/deployments/seed',
    post: {
      success: () => {
        console.error('Not implemented');
      },
    },
  },
};
