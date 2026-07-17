import { apiClient } from '@/core/config/api';
import { API_CONFIG } from '@/core/config/api/endpoints';

export const fetchSourceFieldMapPath = API_CONFIG.fieldMaps.source;

export const fetchSourceFieldMap = (standard: string, source: string) =>
  apiClient.get(fetchSourceFieldMapPath, {
    pathParams: { standard: standard ?? '', source: source ?? '' },
  });

export const fetchStandardFieldMapPath = API_CONFIG.fieldMaps.standard;
export const fetchStandardFieldMap = (standard: string) =>
  apiClient.get(fetchStandardFieldMapPath, {
    pathParams: { standard: standard ?? '' },
  });
