import { components } from '@repo/dfe-engine-types';

export type AlertListResponse =
  components['schemas']['PaginatedResponse_AlertDestinationSummary_'];

export type UseFetchInfiniteFilteredAlertsProps = {
  search?: string;
  hunt?: string;
  per_page?: number;
  sort_by?: string;
  sort_order?: string;
};
