import { apiClient } from '@/core/config/api';
import { API_CONFIG } from '@/core/config/api/endpoints';

export const helmFilesPath = API_CONFIG.helm.listFiles;

export const fetchHelmFilesApi = () => apiClient.get(helmFilesPath);
