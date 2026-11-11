import {
  DfeClientOperationFor,
  DfeClientSuccessResponseBody,
} from '@/core/config/api/client.types';
import { schemaVocabularyPath } from './api';

export type TSchemaVocabularyResponse = DfeClientSuccessResponseBody<
  DfeClientOperationFor<typeof schemaVocabularyPath, 'get'>
>;

export type TSchemaVocabularyChOverride =
  TSchemaVocabularyResponse['ch_overrides'][number];
