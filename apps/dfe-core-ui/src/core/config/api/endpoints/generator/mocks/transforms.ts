import { TTestTransformResponse } from '@/_Transforms/hooks/_useTestTransform/types';
import { TCompileTransformResponse } from '@/_Transforms/hooks/useCompileTransform/types';
import { http, HttpResponse } from 'msw';
import {
  DEFAULT_VALIDATION_ERROR,
  TValidationError,
} from './endpoints.generator.mocks.types';

export const transforms = {
  compile: {
    mockedUrl: '/api/v1/transforms/compile',
    post: {
      success: ({
        mockedResponse = {
          wasm_base64: 'string',
          wasm_bytes: 0,
        },
      }: {
        mockedResponse?: TCompileTransformResponse;
      } = {}) => {
        return http.post(transforms.compile.mockedUrl, () => {
          return HttpResponse.json(mockedResponse);
        });
      },
      error: ({
        mockedResponse = DEFAULT_VALIDATION_ERROR,
        status = 422,
      }: {
        mockedResponse?: TValidationError;
        status?: number;
      } = {}) => {
        return http.post(transforms.compile.mockedUrl, () => {
          return HttpResponse.json(mockedResponse, { status });
        });
      },
    },
  },
  test: {
    mockedUrl: '/api/v1/transforms/test',
    post: {
      success: ({
        mockedResponse = {
          emitted: [
            {
              key: 'string',
              value: 'string',
              headers: {
                additionalProp1: 'string',
                additionalProp2: 'string',
                additionalProp3: 'string',
              },
            },
          ],
          duration_ms: 0,
          wasm_memory_bytes: 0,
        },
      }: {
        mockedResponse?: TTestTransformResponse;
      } = {}) => {
        return http.post(transforms.test.mockedUrl, () => {
          return HttpResponse.json(mockedResponse);
        });
      },
      error: ({
        mockedResponse = DEFAULT_VALIDATION_ERROR,
        status = 422,
      }: {
        mockedResponse?: TValidationError;
        status?: number;
      } = {}) => {
        return http.post(transforms.test.mockedUrl, () => {
          return HttpResponse.json(mockedResponse, { status });
        });
      },
    },
  },
};
