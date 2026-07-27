import { TCreateGovernanceActionResponse } from '@/Platform/hooks/governance/useCreateGovernanceAction/types';
import { TCreateGovernancePolicyResponse } from '@/Platform/hooks/governance/useCreateGovernancePolicy/types';
import { TGovernanceActionDetailResponse } from '@/Platform/hooks/governance/useFetchGovernanceActionDetail/types';
import { TGovernanceActionsResponse } from '@/Platform/hooks/governance/useFetchGovernanceActions/types';
import { TGovernancePoliciesResponse } from '@/Platform/hooks/governance/useFetchGovernancePolicies/types';
import { TGovernancePolicyDetailResponse } from '@/Platform/hooks/governance/useFetchGovernancePolicyDetail/types';
import { TGovernanceActionInvokeResponse } from '@/Platform/hooks/governance/useInvokeGovernanceAction/types';
import { TReconcileGovernanceChRbacResponse } from '@/Platform/hooks/governance/useReconcileGovernanceChRbac/types';
import { http, HttpResponse } from 'msw';
import {
  DEFAULT_VALIDATION_ERROR,
  TValidationError,
} from './endpoints.generator.mocks.types';

export const governance = {
  actions: {
    mockedUrl: '/api/v1/governance/actions',
    get: {
      success: ({
        mockedResponse = ['string'],
      }: {
        mockedResponse?: TGovernanceActionsResponse;
      } = {}) => {
        return http.get(governance.actions.mockedUrl, () => {
          return HttpResponse.json(mockedResponse);
        });
      },
    },
  },
  action: {
    mockedUrl: '/api/v1/governance/actions/{name}',
    get: {
      success: ({
        mockedResponse = {
          name: 'name',
          description: 'description',
          required_action: 'required_action',
          changes: [
            {
              cls: 'cls',
              name: 'name',
              path: 'path',
              value: 'value',
            },
          ],
        },
        name = 'name',
      }: {
        mockedResponse?: TGovernanceActionDetailResponse;
        name?: string;
      } = {}) => {
        return http.get(
          governance.action.mockedUrl.replace('{name}', name),
          () => {
            return HttpResponse.json(mockedResponse);
          },
        );
      },
    },
  },
  policies: {
    mockedUrl: '/api/v1/governance/policies',
    get: {
      success: ({
        mockedResponse = ['string'],
      }: { mockedResponse?: TGovernancePoliciesResponse } = {}) => {
        return http.get(governance.policies.mockedUrl, () => {
          return HttpResponse.json(mockedResponse);
        });
      },
    },
  },
  policy: {
    mockedUrl: '/api/v1/governance/policies/{name}',
    get: {
      success: ({
        mockedResponse = {
          name: 'name',
          description: 'description',
          protected: ['protected'],
        },
        name = 'name',
      }: {
        mockedResponse?: TGovernancePolicyDetailResponse;
        name?: string;
      } = {}) => {
        return http.get(
          governance.policy.mockedUrl.replace('{name}', name),
          () => {
            return HttpResponse.json(mockedResponse);
          },
        );
      },
    },
  },
  invokeAction: {
    mockedUrl: '/api/v1/governance/actions/{name}/invoke',
    post: {
      success: ({
        mockedResponse = {
          dry_run: true,
          changed: true,
          auto_merged: true,
          review_required: true,
          diff: [],
        },
      }: { mockedResponse?: TGovernanceActionInvokeResponse } = {}) => {
        return http.post(governance.invokeAction.mockedUrl, () => {
          return HttpResponse.json(mockedResponse);
        });
      },
      error: ({
        mockedResponse = DEFAULT_VALIDATION_ERROR,
        status = 422,
      }: { mockedResponse?: TValidationError; status?: number } = {}) => {
        return http.post(governance.invokeAction.mockedUrl, () => {
          return HttpResponse.json(mockedResponse, { status });
        });
      },
    },
  },
  adminActions: {
    mockedUrl: '/api/v1/governance/admin/actions',
    post: {
      success: ({
        mockedResponse = {
          name: 'name',
          description: 'description',
          required_action: 'required_action',
          changes: [{ cls: 'cls', name: 'name', path: 'path', value: 'value' }],
        },
      }: {
        mockedResponse?: TCreateGovernanceActionResponse;
      } = {}) => {
        return http.post(governance.adminActions.mockedUrl, () => {
          return HttpResponse.json(mockedResponse);
        });
      },
      error: ({
        mockedResponse = DEFAULT_VALIDATION_ERROR,
        status = 422,
      }: { mockedResponse?: TValidationError; status?: number } = {}) => {
        return http.post(governance.adminActions.mockedUrl, () => {
          return HttpResponse.json(mockedResponse, { status });
        });
      },
    },
  },
  adminAction: {
    mockedUrl: '/api/v1/governance/admin/actions/{name}',
    delete: {
      success: ({
        status = 204,
        name = 'name',
      }: { status?: number; name?: string } = {}) => {
        return http.delete(
          governance.adminAction.mockedUrl.replace('{name}', name),
          () => {
            return HttpResponse.json({}, { status });
          },
        );
      },
      error: ({
        mockedResponse = DEFAULT_VALIDATION_ERROR,
        status = 422,
        name = 'name',
      }: {
        mockedResponse?: TValidationError;
        status?: number;
        name?: string;
      } = {}) => {
        return http.delete(
          governance.adminAction.mockedUrl.replace('{name}', name),
          () => {
            return HttpResponse.json(mockedResponse, { status });
          },
        );
      },
    },
  },
  adminPolicies: {
    mockedUrl: '/api/v1/governance/admin/policies',
    post: {
      success: ({
        mockedResponse = {
          name: 'name',
          description: 'description',
          protected: ['protected'],
        },
      }: {
        mockedResponse?: TCreateGovernancePolicyResponse;
      } = {}) => {
        return http.post(governance.adminPolicies.mockedUrl, () => {
          return HttpResponse.json(mockedResponse);
        });
      },
      error: ({
        mockedResponse = DEFAULT_VALIDATION_ERROR,
        status = 422,
      }: { mockedResponse?: TValidationError; status?: number } = {}) => {
        return http.post(governance.adminPolicies.mockedUrl, () => {
          return HttpResponse.json(mockedResponse, { status });
        });
      },
    },
  },
  adminPolicy: {
    mockedUrl: '/api/v1/governance/admin/policies/{name}',
    delete: {
      success: ({
        status = 204,
        name = 'name',
      }: { status?: number; name?: string } = {}) => {
        return http.delete(
          governance.adminPolicy.mockedUrl.replace('{name}', name),
          () => {
            return HttpResponse.json({}, { status });
          },
        );
      },
      error: ({
        mockedResponse = DEFAULT_VALIDATION_ERROR,
        status = 422,
        name = 'name',
      }: {
        mockedResponse?: TValidationError;
        status?: number;
        name?: string;
      } = {}) => {
        return http.delete(
          governance.adminPolicy.mockedUrl.replace('{name}', name),
          () => {
            return HttpResponse.json(mockedResponse, { status });
          },
        );
      },
    },
  },
  reconcileChRbac: {
    mockedUrl: '/api/v1/governance/ch-rbac/reconcile',
    post: {
      success: ({
        mockedResponse = {
          required_action: 'required_action',
          changes: [{ cls: 'cls', name: 'name', path: 'path', value: 'value' }],
        },
      }: { mockedResponse?: TReconcileGovernanceChRbacResponse } = {}) => {
        return http.post(governance.reconcileChRbac.mockedUrl, () => {
          return HttpResponse.json(mockedResponse);
        });
      },
      error: ({
        mockedResponse = DEFAULT_VALIDATION_ERROR,
        status = 422,
      }: { mockedResponse?: TValidationError; status?: number } = {}) => {
        return http.post(governance.reconcileChRbac.mockedUrl, () => {
          return HttpResponse.json(mockedResponse, { status });
        });
      },
    },
  },
};
