import { API_CONFIG_MOCKS } from '@/core/config/api/endpoints/generator';
import { pageOf } from '@/core/utils/test-utils/pageOf';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { TAlertListResponseItem } from './types';

const ALERT_ITEM: TAlertListResponseItem = {
  name: 'string',
  description: 'string',
  enabled: true,
  url_scheme: 'string',
} as const;

const TOTAL_ITEMS = 25;
const ALL_ITEMS = Array.from({ length: TOTAL_ITEMS }, () => ({
  ...ALERT_ITEM,
}));

function createPaginatedAlertsHandler() {
  return http.get(
    API_CONFIG_MOCKS.alerts.destinations.mockedUrl,
    ({ request }) => {
      return HttpResponse.json(pageOf(ALL_ITEMS, request));
    },
  );
}

const handlers = [createPaginatedAlertsHandler()];

export const server = setupServer(...handlers);
