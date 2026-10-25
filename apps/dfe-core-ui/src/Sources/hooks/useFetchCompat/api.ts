import { apiClient } from '@/core/config/api';
import { API_CONFIG } from '@/core/config/api/endpoints';

export const compatPath = API_CONFIG.ingest.compat;

export const fetchCompat = () => apiClient.getWithEtag(compatPath);
