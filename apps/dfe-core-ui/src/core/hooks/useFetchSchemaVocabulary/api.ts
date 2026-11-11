import { apiClient } from '@/core/config/api';
import { API_CONFIG } from '@/core/config/api/endpoints';

export const schemaVocabularyPath = API_CONFIG.schemas.vocabulary;

export const fetchSchemaVocabularyApi = () =>
  apiClient.get(schemaVocabularyPath);
