import { API_CONFIG_MOCKS } from '@/core/config/api/endpoints/generator';
import { buildTestWrapper } from '@/core/utils/test-utils/buildTestWrapper';
import { renderHook, waitFor } from '@testing-library/react';
import { afterAll, afterEach, beforeAll, describe, expect, test } from 'vitest';
import { useFetchSchemaVocabulary } from '.';
import { server } from './useFetchSchemaVocabulary.mocks';
import { SCHEMA_VOCABULARY_FIXTURE } from './vocabulary.fixture';

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('.useFetchSchemaVocabulary', () => {
  test('returns the vocabulary the engine serves', async () => {
    const { wrapper } = buildTestWrapper().withReactQuery();
    const { result } = renderHook(() => useFetchSchemaVocabulary(), {
      wrapper,
    });

    await waitFor(() => {
      expect(result.current.data).toEqual(SCHEMA_VOCABULARY_FIXTURE);
    });
  });

  test('returns an error when the engine refuses', async () => {
    server.use(API_CONFIG_MOCKS.schemas.vocabulary.get.error());
    const { wrapper } = buildTestWrapper().withReactQuery();
    const { result } = renderHook(() => useFetchSchemaVocabulary(), {
      wrapper,
    });

    await waitFor(() => {
      expect(result.current.error).toBeDefined();
    });
    expect(result.current.data).toBeUndefined();
  });
});
