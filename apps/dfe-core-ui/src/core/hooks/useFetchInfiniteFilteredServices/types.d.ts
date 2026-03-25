import { components } from '@repo/dfe-engine-types';

export type ServiceListResponse =
  components['schemas']['PaginatedResponse_ServiceConfigSummary_'];
export type ServiceSummary = components['schemas']['ServiceSummary'];
export interface ServiceListRequestParams {
  search?: string;
  service?: string;
  sort_by?: string;
  sort_order?: string;
  page?: number;
  per_page?: number;
}

export type UseFetchInfiniteFilteredServicesProps = Omit<
  ServiceListRequestParams,
  'page'
>;
