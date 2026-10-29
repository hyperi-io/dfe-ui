import { API_CONFIG_MOCKS } from '@/core/config/api/endpoints/generator';

/** The signed-in user, bound to `org`. */
export const signedInAs = (org: string) =>
  API_CONFIG_MOCKS.accounts.me.get.success({
    mockedResponse: {
      username: 'admin',
      oidc_id: '',
      enabled: true,
      blocked: false,
      disabled_at: '',
      blocked_at: '',
      external: false,
      password_change_required: false,
      groups: [],
      email: 'admin@example.com',
      phone: '',
      name: 'Admin',
      org,
      created_at: '',
      updated_at: '',
    },
  });

/** Two organisations, Acme Corp (`acme`) and Globex (`globex`). */
export const listedOrgs = API_CONFIG_MOCKS.orgs.default.get.success({
  mockedResponse: {
    items: [
      { name: 'acme', display_name: 'Acme Corp' },
      { name: 'globex', display_name: 'Globex' },
    ].map((org) => ({
      ...org,
      org_ids: [],
      enabled: true,
      created_at: '',
      updated_at: '',
    })),
    total: 2,
    page: 1,
    per_page: 10,
    total_pages: 1,
    next_page: null,
    prev_page: null,
  },
});

/** jsdom has no IntersectionObserver, and the organisation list pages on one. */
export class MockIntersectionObserver {
  observe = () => undefined;
  unobserve = () => undefined;
  disconnect = () => undefined;
}
