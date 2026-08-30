import { API_CONFIG_MOCKS } from '@/core/config/api/endpoints/generator';
import { TAuthMeResponse } from '@/core/hooks/useAuthMe/types';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

const ADMIN_MOCKED_RESPONSE: TAuthMeResponse = {
  org_id: 'string',
  user_id: 'string',
  roles: ['role'],
  permissions: ['*'],
  groups: ['group'],
};

export const server = setupServer(
  API_CONFIG_MOCKS.auth.me.get.success({
    mockedResponse: ADMIN_MOCKED_RESPONSE,
  }),
  API_CONFIG_MOCKS.backingServices.default.get.success(),
  // The section writes to several services, so the write handler matches by
  // path params rather than one built URL.
  http.put('/api/v1/backing-services/overlays/:name/vars/:path', () =>
    HttpResponse.json({
      changed: true,
      commit_sha: 'abc1234',
      auto_merged: true,
      review_required: false,
      pr_url: null,
      reload: 'roll',
    }),
  ),
);
