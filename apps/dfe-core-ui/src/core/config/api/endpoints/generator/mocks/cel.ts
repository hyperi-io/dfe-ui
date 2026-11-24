import { TCheckCelResponse } from '@/core/hooks/useCelCheck/types';
import { TCheckCelBatchResponse } from '@/core/hooks/useCelCheckBatch/types';
import { http, HttpResponse } from 'msw';
import {
  DEFAULT_VALIDATION_ERROR,
  TValidationError,
} from './endpoints.generator.mocks.types';

export const cel = {
  check: {
    mockedUrl: '/api/v1/cel/check',
    post: {
      success: ({
        mockedResponse = {
          valid: true,
          errors: ['string'],
          tier: 'tier1',
          tier_label: 'string',
          fields: ['string'],
          op_kind: 'string',
          op_field: 'string',
          op_value: 'string',
          description: 'string',
          opt_in_required: 'string',
        },
      }: {
        mockedResponse?: TCheckCelResponse;
      } = {}) => {
        return http.post(cel.check.mockedUrl, () => {
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
        return http.post(cel.check.mockedUrl, () => {
          return HttpResponse.json(mockedResponse, { status });
        });
      },
    },
  },
  checkBatch: {
    mockedUrl: '/api/v1/cel/check-batch',
    post: {
      success: ({
        mockedResponse = {
          results: [
            {
              valid: true,
              errors: ['string'],
              tier: 'tier1',
              tier_label: 'string',
              fields: ['string'],
              op_kind: 'string',
              op_field: 'string',
              op_value: 'string',
              description: 'string',
              opt_in_required: 'string',
            },
          ],
        },
      }: {
        mockedResponse?: TCheckCelBatchResponse;
      } = {}) => {
        return http.post(cel.checkBatch.mockedUrl, () => {
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
        return http.post(cel.checkBatch.mockedUrl, () => {
          return HttpResponse.json(mockedResponse, { status });
        });
      },
    },
  },
};
