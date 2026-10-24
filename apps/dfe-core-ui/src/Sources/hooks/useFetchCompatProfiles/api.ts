import { apiClient } from '@/core/config/api';
import { API_CONFIG } from '@/core/config/api/endpoints';

export const compatProfilesPath = API_CONFIG.ingest.compatProfiles;

/** A deployment stores a handful of profiles, so one page holds them all. */
export const fetchCompatProfiles = () =>
  apiClient.get(compatProfilesPath, { queryParams: { page_size: 1000 } });
