import { API_CONFIG_MOCKS } from '@/core/config/api/endpoints/generator';
import { pageOf } from '@/core/utils/test-utils/pageOf';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { TOrganisationListSummary } from './types';

const ORGANISATION_ITEM: TOrganisationListSummary = {
  name: 'string',
  display_name: 'string',
  org_ids: ['string'],
  enabled: true,
  created_at: '2021-01-01',
  updated_at: '2021-01-01',
};

const TOTAL_ITEMS = 25;
const ALL_ITEMS = Array.from({ length: TOTAL_ITEMS }, () => ORGANISATION_ITEM);

function createPaginatedOrganisationsHandler() {
  return http.get(API_CONFIG_MOCKS.orgs.default.mockedUrl, ({ request }) => {
    return HttpResponse.json(pageOf(ALL_ITEMS, request));
  });
}

const handlers = [createPaginatedOrganisationsHandler()];

export const server = setupServer(...handlers);
