import {
  TFetchStandardFieldMapResponse,
  TSourceFieldMapResponse,
} from '@/_FieldMaps/hooks/useFetchFieldMapDetail/types';
import { TFetchServiceDetailResponse } from '@/_Services/hooks/useFetchServiceDetail/types';
import { TTestTransformResponse } from '@/_Transforms/hooks/_useTestTransform/types';
import { TCompileTransformResponse } from '@/_Transforms/hooks/useCompileTransform/types';
import {
  RESOURCE_TYPES,
  SCHEMA_FIELD_TYPES,
} from '@/core/components/CreateSchemaForm/fieldType.constants';
import { TFetchPermissionsResponse } from '@/core/hooks/_useFetchPermissions/types';
import { TAuthMeResponse } from '@/core/hooks/useAuthMe/types';
import { TCreateFieldMapResponse } from '@/core/hooks/useCreateFieldMap/types';
import { TCreateSchemaResponse } from '@/core/hooks/useCreateSchema/types';
import { TElasticConvertResponse } from '@/core/hooks/useElasticConvert/types';
import { TFieldMapListResponse } from '@/core/hooks/useFetchInfiniteFilteredFieldMaps/types';
import { THuntListResponse } from '@/core/hooks/useFetchInfiniteFilteredHunts/types';
import { TOrganisationListResponse } from '@/core/hooks/useFetchInfiniteFilteredOrganisations/types';
import { TRuleListResponse } from '@/core/hooks/useFetchInfiniteFilteredRules/types';
import { TSchemaListResponse } from '@/core/hooks/useFetchInfiniteFilteredSchemas/types';
import { TServiceListResponse } from '@/core/hooks/useFetchInfiniteFilteredServices/types';
import { TSourceListResponse } from '@/core/hooks/useFetchInfiniteFilteredSources/types';
import { TLoginResponse } from '@/core/hooks/useLogin/types';
import { TRefreshTokenResponse } from '@/core/hooks/useRefreshToken/types';
import { THuntEngineStatus } from '@/Hunts/hooks/_useFetchEngineStatus/types';
import { TAlertCreateResponse } from '@/Hunts/hooks/useCreateAlert/types';
import { THuntCreateResponse } from '@/Hunts/hooks/useCreateHunt/types';
import { TAlertDetailResponse } from '@/Hunts/hooks/useFetchAlertDetail/types';
import { THuntDetailResponse } from '@/Hunts/hooks/useFetchHuntDetail/types';
import { TAlertListResponse } from '@/Hunts/hooks/useFetchInfiniteFilteredAlerts/types';
import { TTriggerResponse } from '@/Hunts/hooks/useTriggerHunt/types';
import { TAlertUpdateResponse } from '@/Hunts/hooks/useUpdateAlert/types';
import { TRuleCreateResponse } from '@/Rules/hooks/useCreateRule/types';
import { TRuleDetail } from '@/Rules/hooks/useFetchRuleDetail/types';
import { TRuleUpdateResponse } from '@/Rules/hooks/useUpdateRule/types';
import { TSqlValidationResponse } from '@/Rules/hooks/useValidateRule/types';
import { TSchemaCreateVersionResponse } from '@/Schemas/hooks/useCreateSchemaVersion/types';
import { TMetaSchemaDetailResponse } from '@/Schemas/hooks/useFetchInfiniteSchemaDetailColumns/types';
import { TMetaSchemaUpdateResponse } from '@/Schemas/hooks/useUpdateSchema/types';
import { TAccountResetPasswordResponse } from '@/Settings/hooks/useAccountResetPassword/types';
import { TAddGroupMemberResponse } from '@/Settings/hooks/useAddGroupMember/types';
import { TAccountCreateResponse } from '@/Settings/hooks/useCreateAccount/types';
import { TGroupCreateResponse } from '@/Settings/hooks/useCreateGroup/types';
import { TCreateOidcProviderResponse } from '@/Settings/hooks/useCreateOidcProvider/types';
import { TOrganisationCreateResponse } from '@/Settings/hooks/useCreateOrganisation/types';
import { TRoleCreateResponse } from '@/Settings/hooks/useCreateRole/types';
import { TAccountDetailResponse } from '@/Settings/hooks/useFetchAccountDetail/types';
import { TGroupDetailResponse } from '@/Settings/hooks/useFetchGroupDetail/types';
import { TAccountsResponse } from '@/Settings/hooks/useFetchInfiniteFilteredAccounts/types';
import { TGroupsResponse } from '@/Settings/hooks/useFetchInfiniteFilteredGroups/types';
import { TRoleListResponse } from '@/Settings/hooks/useFetchInfiniteFilteredRoles/types';
import { TRoleScopesResponse } from '@/Settings/hooks/useFetchInfiniteFilteredRoleScopes/types';
import { TOrganisationDetail } from '@/Settings/hooks/useFetchOrganisationDetail/types';
import { TRoleDetail } from '@/Settings/hooks/useFetchRoleDetail/types';
import { TRemoveGroupMemberResponse } from '@/Settings/hooks/useRemoveGroupMember/types';
import { TAccountUpdateResponse } from '@/Settings/hooks/useUpdateAccount/types';
import { TGroupUpdateResponse } from '@/Settings/hooks/useUpdateGroup/types';
import { TOrganisationUpdateResponse } from '@/Settings/hooks/useUpdateOrganisation/types';
import { TRoleUpdateResponse } from '@/Settings/hooks/useUpdateRole/types';
import { TSourceBuildResponse } from '@/Sources/hooks/useBuildSource/types';
import { TSourceCreateResponse } from '@/Sources/hooks/useCreateSource/types';
import { TSourceDeployResponse } from '@/Sources/hooks/useDeploySource/types';
import { TSourceColumnsResponse } from '@/Sources/hooks/useFetchInfiniteSourceColumns/types';
import { TJsonPathsResponse } from '@/Sources/hooks/useFetchJsonPaths/types';
import { TSampleRowsResponse } from '@/Sources/hooks/useFetchSampleRows/types';
import { TSourceVersionDetail } from '@/Sources/hooks/useFetchSourceDetail/types';
import { TSourcePatchResponse } from '@/Sources/hooks/usePatchSource/types';
import { TSourcePlanResponse } from '@/Sources/hooks/usePlanSource/types';
import { TPromoteFieldResponse } from '@/Sources/hooks/usePromoteFields/types';
import { TSourceUpdateResponse } from '@/Sources/hooks/useUpdateSource/types';
import { http, HttpResponse } from 'msw';
import {
  DEFAULT_VALIDATION_ERROR,
  TValidationError,
} from './endpoints.generator.mocks.types';

export const API_CONFIG_MOCKS = Object.freeze({
  auth: {
    login: {
      mockedUrl: '/api/v1/auth/login',
      post: {
        success: ({
          mockedResponse = {
            access_token: 'string',
            token_type: 'bearer',
            expires_in: 0,
            user_id: 'string',
            roles: ['string'],
          },
        }: {
          mockedResponse?: TLoginResponse;
        } = {}) =>
          http.post(API_CONFIG_MOCKS.auth.login.mockedUrl, () => {
            return HttpResponse.json(mockedResponse);
          }),
      },
    },
    refresh: {
      mockedUrl: '/api/v1/auth/refresh',
      post: {
        success: ({
          mockedResponse = {
            access_token: 'refreshed-token',
            token_type: 'bearer',
            expires_in: 3600,
            user_id: 'string',
            roles: ['string'],
          },
        }: {
          mockedResponse?: TRefreshTokenResponse;
        } = {}) =>
          http.post(API_CONFIG_MOCKS.auth.refresh.mockedUrl, () => {
            return HttpResponse.json(mockedResponse);
          }),
        error: ({
          mockedResponse = DEFAULT_VALIDATION_ERROR,
          status = 401,
        }: {
          mockedResponse?: TValidationError;
          status?: number;
        } = {}) => {
          return http.post(API_CONFIG_MOCKS.auth.refresh.mockedUrl, () => {
            return HttpResponse.json(mockedResponse, { status });
          });
        },
      },
    },
    me: {
      mockedUrl: '/api/v1/auth/me',
      get: {
        success: ({
          mockedResponse = {
            org_id: 'string',
            user_id: 'string',
            roles: ['string'],
            permissions: ['string'],
            groups: ['string'],
          },
        }: {
          mockedResponse?: TAuthMeResponse;
        } = {}) =>
          http.get(API_CONFIG_MOCKS.auth.me.mockedUrl, () => {
            return HttpResponse.json(mockedResponse);
          }),
        error: ({
          mockedResponse = DEFAULT_VALIDATION_ERROR,
          status = 422,
        }: {
          mockedResponse?: TValidationError;
          status?: number;
        } = {}) => {
          return http.get(API_CONFIG_MOCKS.auth.me.mockedUrl, () => {
            return HttpResponse.json(mockedResponse, { status });
          });
        },
      },
    },
    permissions: {
      mockedUrl: '/api/v1/auth/permissions',
      get: {
        success: ({
          mockedResponse = {
            roles: ['string'],
            permissions: ['string'],
          },
        }: {
          mockedResponse?: TFetchPermissionsResponse;
        } = {}) => {
          return http.get(API_CONFIG_MOCKS.auth.permissions.mockedUrl, () => {
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
          return http.get(API_CONFIG_MOCKS.auth.permissions.mockedUrl, () => {
            return HttpResponse.json(mockedResponse, { status });
          });
        },
      },
    },
  },
  sources: {
    default: {
      mockedUrl: '/api/v1/sources',
      get: {
        success: ({
          mockedResponse = {
            items: [
              {
                name: 'string',
                display_name: 'string',
                description: 'string',
                enabled: true,
                current: 'string',
                versions: ['string'],
                deployed_version: 'string',
                updated_at: 'string',
                header_type: 'string',
                has_transform: false,
                has_fetcher: false,
                state: 'active',
              },
            ],
            objects: {
              items: [],
              children: {},
            },
            total: 0,
            page: 0,
            per_page: 0,
            total_pages: 0,
            next_page: 0,
            prev_page: 0,
          },
        }: {
          mockedResponse?: TSourceListResponse;
        } = {}) =>
          http.get(API_CONFIG_MOCKS.sources.default.mockedUrl, () => {
            return HttpResponse.json(mockedResponse);
          }),
        error: ({
          mockedResponse = DEFAULT_VALIDATION_ERROR,
          status = 422,
        }: {
          mockedResponse?: TValidationError;
          status?: number;
        } = {}) => {
          return http.get(API_CONFIG_MOCKS.sources.default.mockedUrl, () => {
            return HttpResponse.json(mockedResponse, { status });
          });
        },
      },
      post: {
        success: ({
          mockedResponse = {
            source: 'string',
            message: 'ok',
            current: 'string',
            versions: ['string'],
          },
        }: {
          mockedResponse?: TSourceCreateResponse;
        } = {}) => {
          return http.post(API_CONFIG_MOCKS.sources.default.mockedUrl, () => {
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
          return http.post(API_CONFIG_MOCKS.sources.default.mockedUrl, () => {
            return HttpResponse.json(mockedResponse, { status });
          });
        },
      },
    },
    source: {
      mockedUrl: '/api/v1/sources/{name}',
      get: {
        success: ({
          mockedResponse = {
            source: 'source',
            enabled: true,
            display_name: 'string',
            description: 'string',
            current: 'string',
            versions: ['1.0.0'],
            selected: '1.0.0',
            previous_deployed_versions: ['1.0.0'],
            state: 'active',
            version: {
              date_time: 'string',
              header: {
                type: 'string',
                version: 'string',
              },
              schema: {
                meta_schema: 'string',
                meta_schema_version: 'string',
                ttl_days: 0,
                engine: 'string',
              },
              fetcher: {
                source_type: 'string',
                base_url: 'string',
                auth: {
                  type: 'string',
                  token_url: 'string',
                  client_id: 'string',
                  client_secret: 'string',
                  api_key: 'string',
                },
                poll_interval_secs: 0,
              },
              transform: {
                engine: 'string',
                config_file: 'string',
                env: {
                  string: 'string',
                },
                files: ['string'],
              },
              match: {
                field: 'string',
                operator: 'equals',
                value: 'string',
              },
            },
          },
          name = 'source',
        }: {
          mockedResponse?: TSourceVersionDetail;
          name?: string;
        } = {}) => {
          return http.get(
            API_CONFIG_MOCKS.sources.source.mockedUrl.replace('{name}', name),
            () => {
              return HttpResponse.json(mockedResponse);
            },
          );
        },
        error: ({
          mockedResponse = DEFAULT_VALIDATION_ERROR,
          status = 422,
          name = 'source',
        }: {
          mockedResponse?: TValidationError;
          status?: number;
          name?: string;
        } = {}) => {
          return http.get(
            API_CONFIG_MOCKS.sources.source.mockedUrl.replace('{name}', name),
            () => {
              return HttpResponse.json(mockedResponse, { status });
            },
          );
        },
      },
      put: {
        success: ({
          mockedResponse = {
            source: 'string',
            message: 'ok',
            current: 'string',
            versions: ['string'],
          },
          name = 'source',
        }: {
          mockedResponse?: TSourceUpdateResponse;
          name?: string;
        } = {}) => {
          return http.put(
            API_CONFIG_MOCKS.sources.source.mockedUrl.replace('{name}', name),
            () => {
              return HttpResponse.json(mockedResponse);
            },
          );
        },
        error: ({
          mockedResponse = DEFAULT_VALIDATION_ERROR,
          status = 422,
          name = 'source',
        }: {
          mockedResponse?: TValidationError;
          status?: number;
          name?: string;
        } = {}) => {
          return http.put(
            API_CONFIG_MOCKS.sources.source.mockedUrl.replace('{name}', name),
            () => {
              return HttpResponse.json(mockedResponse, { status });
            },
          );
        },
      },
      patch: {
        success: ({
          mockedResponse = {
            source: 'string',
            message: 'ok',
            current: 'string',
            versions: ['string'],
          },
          name = 'source',
        }: {
          mockedResponse?: TSourcePatchResponse;
          name?: string;
        } = {}) => {
          return http.patch(
            API_CONFIG_MOCKS.sources.source.mockedUrl.replace('{name}', name),
            () => {
              return HttpResponse.json(mockedResponse);
            },
          );
        },
        error: ({
          mockedResponse = DEFAULT_VALIDATION_ERROR,
          status = 422,
          name = 'source',
        }: {
          mockedResponse?: TValidationError;
          status?: number;
          name?: string;
        } = {}) => {
          return http.patch(
            API_CONFIG_MOCKS.sources.source.mockedUrl.replace('{name}', name),
            () => {
              return HttpResponse.json(mockedResponse, { status });
            },
          );
        },
      },
      delete: {
        success: ({ name = 'source' }: { name?: string } = {}) => {
          return http.delete(
            API_CONFIG_MOCKS.sources.source.mockedUrl.replace('{name}', name),
            () => {
              return HttpResponse.json({});
            },
          );
        },
        error: ({
          mockedResponse = DEFAULT_VALIDATION_ERROR,
          status = 422,
          name = 'source',
        }: {
          mockedResponse?: TValidationError;
          status?: number;
          name?: string;
        } = {}) => {
          return http.delete(
            API_CONFIG_MOCKS.sources.source.mockedUrl.replace('{name}', name),
            () => {
              return HttpResponse.json(mockedResponse, { status });
            },
          );
        },
      },
    },
    sourceColumns: {
      mockedUrl: '/api/v1/sources/{name}/columns',
      get: {
        success: ({
          mockedResponse = {
            items: [],
            total: 0,
            page: 0,
            per_page: 0,
            total_pages: 0,
            next_page: 0,
            prev_page: 0,
          },
          source_name = 'source',
        }: {
          mockedResponse?: TSourceColumnsResponse;
          source_name?: string;
        } = {}) => {
          return http.get(
            API_CONFIG_MOCKS.sources.sourceColumns.mockedUrl.replace(
              '{name}',
              source_name,
            ),
            () => {
              return HttpResponse.json(mockedResponse);
            },
          );
        },
        error: ({
          mockedResponse = DEFAULT_VALIDATION_ERROR,
          status = 422,
          source_name = 'source',
        }: {
          mockedResponse?: TValidationError;
          status?: number;
          source_name?: string;
        } = {}) => {
          return http.get(
            API_CONFIG_MOCKS.sources.sourceColumns.mockedUrl.replace(
              '{name}',
              source_name,
            ),
            () => {
              return HttpResponse.json(mockedResponse, { status });
            },
          );
        },
      },
    },
    sourceBuild: {
      mockedUrl: '/api/v1/sources/{name}/build',
      post: {
        success: ({
          mockedResponse = {
            source_name: 'source',
            version: 'string',
            columns: [],
            ddl: {
              source_name: 'source',
              create_table: 'string',
              views: {
                view1: 'string',
                view2: 'string',
              },
            },
          },
          source_name = 'source',
        }: {
          mockedResponse?: TSourceBuildResponse;
          source_name?: string;
        } = {}) => {
          return http.post(
            API_CONFIG_MOCKS.sources.sourceBuild.mockedUrl.replace(
              '{name}',
              source_name,
            ),
            () => {
              return HttpResponse.json(mockedResponse);
            },
          );
        },
        error: ({
          mockedResponse = DEFAULT_VALIDATION_ERROR,
          status = 422,
          source_name = 'source',
        }: {
          mockedResponse?: TValidationError;
          status?: number;
          source_name?: string;
        } = {}) => {
          return http.post(
            API_CONFIG_MOCKS.sources.sourceBuild.mockedUrl.replace(
              '{name}',
              source_name,
            ),
            () => {
              return HttpResponse.json(mockedResponse, { status });
            },
          );
        },
      },
    },
    sourceVersion: {
      mockedUrl: '/api/v1/sources/{name}/versions/{version}',
      get: {
        success: ({
          mockedResponse = {
            source: 'source',
            display_name: 'string',
            description: 'string',
            enabled: true,
            current: 'string',
            deployed_version: 'string',
            selected: 'string',
            versions: ['string'],
            state: 'active',
            version: {
              date_time: 'string',
              header: {
                type: 'string',
                version: 'string',
              },
              schema: {
                meta_schema: 'string',
                meta_schema_version: 'string',
                ttl_days: 0,
                engine: 'string',
              },
              fetcher: {
                source_type: 'string',
                base_url: 'string',
                auth: {
                  type: 'string',
                  token_url: 'string',
                  client_id: 'string',
                  client_secret: 'string',
                  api_key: 'string',
                },
                poll_interval_secs: 0,
              },
              transform: {
                engine: 'string',
                config_file: 'string',
                env: {
                  string: 'string',
                },
                files: ['string'],
              },
              match: {
                field: 'string',
                operator: 'equals',
                value: 'string',
              },
            },
          },
          name = 'source',
          version = '1.0.0',
        }: {
          mockedResponse?: TSourceVersionDetail;
          name?: string;
          version?: string;
        } = {}) => {
          return http.get(
            API_CONFIG_MOCKS.sources.sourceVersion.mockedUrl
              .replace('{name}', name)
              .replace('{version}', version),
            () => {
              return HttpResponse.json(mockedResponse);
            },
          );
        },
        error: ({
          mockedResponse = DEFAULT_VALIDATION_ERROR,
          status = 422,
          name = 'source',
        }: {
          mockedResponse?: TValidationError;
          status?: number;
          name?: string;
        } = {}) => {
          return http.get(
            API_CONFIG_MOCKS.sources.sourceVersion.mockedUrl.replace(
              '{name}',
              name,
            ),
            () => {
              return HttpResponse.json(mockedResponse, { status });
            },
          );
        },
      },
    },
    bulk: {
      mockedUrl: '/api/v1/sources/bulk',
      post: {
        success: () => {
          console.error('Not implemented');
        },
      },
    },
    seed: {
      mockedUrl: '/api/v1/sources/seed',
      post: {
        success: () => {
          console.error('Not implemented');
        },
      },
    },
    plan: {
      mockedUrl: '/api/v1/sources/{name}/plan',
      get: {
        success: ({
          mockedResponse = {
            source_name: 'string',
            version: 'string',
            planned_at: 'string',
            table_exists: true,
            validation_errors: ['string'],
            statements: ['string'],
            ddl: {
              source_name: 'string',
              create_table: 'string',
              views: {
                view1: 'string',
                view2: 'string',
              },
            },
            ready: true,
          },
          name = 'source',
        }: {
          mockedResponse?: TSourcePlanResponse;
          name?: string;
        } = {}) => {
          return http.get(
            API_CONFIG_MOCKS.sources.plan.mockedUrl.replace('{name}', name),
            () => {
              return HttpResponse.json(mockedResponse);
            },
          );
        },
      },
      post: {
        success: ({
          mockedResponse = {
            source_name: 'string',
            version: 'string',
            planned_at: 'string',
            table_exists: true,
            validation_errors: ['string'],
            statements: ['string'],
            ddl: {
              source_name: 'string',
              create_table: 'string',
              views: {
                view1: 'string',
                view2: 'string',
              },
            },
            ready: true,
          },
          name = 'source',
        }: {
          mockedResponse?: TSourcePlanResponse;
          name?: string;
        } = {}) => {
          return http.post(
            API_CONFIG_MOCKS.sources.plan.mockedUrl.replace('{name}', name),
            () => {
              return HttpResponse.json(mockedResponse);
            },
          );
        },
        error: ({
          mockedResponse = DEFAULT_VALIDATION_ERROR,
          status = 422,
          name = 'source',
        }: {
          mockedResponse?: TValidationError;
          status?: number;
          name?: string;
        } = {}) => {
          return http.post(
            API_CONFIG_MOCKS.sources.plan.mockedUrl.replace('{name}', name),
            () => {
              return HttpResponse.json(mockedResponse, { status });
            },
          );
        },
      },
    },
    deploy: {
      mockedUrl: '/api/v1/sources/{name}/deploy',
      post: {
        success: ({
          mockedResponse = {
            source_name: 'string',
            version: 'string',
            dry_run: false,
            applied: true,
            create_table: 'string',
            statements_applied: 0,
          },
          name = 'source',
        }: {
          mockedResponse?: TSourceDeployResponse;
          name?: string;
        } = {}) => {
          return http.post(
            API_CONFIG_MOCKS.sources.deploy.mockedUrl.replace('{name}', name),
            () => {
              return HttpResponse.json(mockedResponse);
            },
          );
        },
        error: ({
          mockedResponse = DEFAULT_VALIDATION_ERROR,
          status = 422,
          name = 'source',
        }: {
          mockedResponse?: TValidationError;
          status?: number;
          name?: string;
        } = {}) => {
          return http.post(
            API_CONFIG_MOCKS.sources.deploy.mockedUrl.replace('{name}', name),
            () => {
              return HttpResponse.json(mockedResponse, { status });
            },
          );
        },
      },
    },
  },
  services: {
    default: {
      mockedUrl: '/api/v1/services',
      get: {
        success: ({
          mockedResponse = {
            items: [
              {
                service: 'string',
                instance: 'string',
                updated_at: 'string',
              },
            ],
            total: 0,
            page: 0,
            per_page: 0,
            total_pages: 0,
            next_page: 0,
            prev_page: 0,
          },
        }: {
          mockedResponse?: TServiceListResponse;
        } = {}) => {
          return http.get(API_CONFIG_MOCKS.services.default.mockedUrl, () => {
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
          return http.get(API_CONFIG_MOCKS.services.default.mockedUrl, () => {
            return HttpResponse.json(mockedResponse, { status });
          });
        },
      },
    },
    instance: {
      mockedUrl: '/api/v1/services/{service}/{instance}',
      get: {
        success: ({
          mockedResponse = {
            service: 'service',
            instance: 'instance',
            config: {},
          },
          service = 'service',
          instance = 'instance',
        }: {
          mockedResponse?: TFetchServiceDetailResponse;
          service?: string;
          instance?: string;
        } = {}) => {
          return http.get(
            API_CONFIG_MOCKS.services.instance.mockedUrl
              .replace('{service}', service)
              .replace('{instance}', instance),
            () => {
              return HttpResponse.json(mockedResponse);
            },
          );
        },
        error: ({
          mockedResponse = DEFAULT_VALIDATION_ERROR,
          status = 422,
          service = 'string',
          instance = 'string',
        }: {
          mockedResponse?: TValidationError;
          status?: number;
          service?: string;
          instance?: string;
        } = {}) => {
          return http.get(
            API_CONFIG_MOCKS.services.instance.mockedUrl
              .replace('{service}', service)
              .replace('{instance}', instance),
            () => {
              return HttpResponse.json(mockedResponse, { status });
            },
          );
        },
      },
      put: {
        success: () => {
          console.error('Not implemented');
        },
      },
      delete: {
        success: () => {
          console.error('Not implemented');
        },
      },
    },
    validate: {
      mockedUrl: '/api/v1/services/{service}/{instance}/validate',
      post: {
        success: () => {
          console.error('Not implemented');
        },
      },
    },
    history: {
      mockedUrl: '/api/v1/services/{service}/{instance}/history',
      get: {
        success: () => {
          console.error('Not implemented');
        },
      },
    },
    seed: {
      mockedUrl: '/api/v1/services/seed',
      post: {
        success: () => {
          console.error('Not implemented');
        },
      },
    },
  },
  deployments: {
    default: {
      mockedUrl: '/api/v1/deployments',
      get: {
        success: () => {
          console.error('Not implemented');
        },
      },
    },
    deployment: {
      mockedUrl: '/api/v1/deployments/{service}/{instance}',
      get: {
        success: () => {
          console.error('Not implemented');
        },
      },
      put: {
        success: () => {
          console.error('Not implemented');
        },
      },
      delete: {
        success: () => {
          console.error('Not implemented');
        },
      },
    },
    validate: {
      mockedUrl: '/api/v1/deployments/{service}/{instance}/validate',
      post: {
        success: () => {
          console.error('Not implemented');
        },
      },
    },
    history: {
      mockedUrl: '/api/v1/deployments/{service}/{instance}/history',
      get: {
        success: () => {
          console.error('Not implemented');
        },
      },
    },
    applySize: {
      mockedUrl: '/api/v1/deployments/{service}/{instance}/size/{size}',
      post: {
        success: () => {
          console.error('Not implemented');
        },
      },
    },
    seed: {
      mockedUrl: '/api/v1/deployments/seed',
      post: {
        success: () => {
          console.error('Not implemented');
        },
      },
    },
  },
  fieldMaps: {
    default: {
      mockedUrl: '/api/v1/field-maps',
      get: {
        success: ({
          mockedResponse = {
            items: [
              {
                standard: 'string',
                source: 'string',
                is_default: false,
                version: 'string',
                mapping_count: 0,
                updated_at: 'string',
              },
            ],
            total: 0,
            page: 0,
            per_page: 0,
            total_pages: 0,
            next_page: 0,
            prev_page: 0,
          },
        }: {
          mockedResponse?: TFieldMapListResponse;
        } = {}) => {
          return http.get(API_CONFIG_MOCKS.fieldMaps.default.mockedUrl, () => {
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
          return http.get(API_CONFIG_MOCKS.fieldMaps.default.mockedUrl, () => {
            return HttpResponse.json(mockedResponse, { status });
          });
        },
      },
      post: {
        success: ({
          mockedResponse = {
            standard: 'string',
            source: 'string',
            version: 'string',
            description: 'string',
            inherits: 'string',
            mappings: {
              additionalProp1: 'string',
              additionalProp2: 'string',
              additionalProp3: 'string',
            },
          },
        }: {
          mockedResponse?: TCreateFieldMapResponse;
        } = {}) => {
          return http.post(API_CONFIG_MOCKS.fieldMaps.default.mockedUrl, () => {
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
          return http.post(API_CONFIG_MOCKS.fieldMaps.default.mockedUrl, () => {
            return HttpResponse.json(mockedResponse, { status });
          });
        },
      },
    },
    standard: {
      mockedUrl: '/api/v1/field-maps/{standard}',
      get: {
        success: ({
          mockedResponse = {
            standard: 'standard',
            source: null,
            version: 'string',
            description: 'string',
            inherits: 'string',
            mappings: {
              additionalProp1: 'string',
              additionalProp2: 'string',
              additionalProp3: 'string',
            },
          },
          standard = 'standard',
        }: {
          mockedResponse?: TFetchStandardFieldMapResponse;
          standard?: string;
          source?: string;
        } = {}) => {
          return http.get(
            API_CONFIG_MOCKS.fieldMaps.standard.mockedUrl.replace(
              '{standard}',
              standard,
            ),
            () => {
              return HttpResponse.json(mockedResponse);
            },
          );
        },
      },
    },
    source: {
      mockedUrl: '/api/v1/field-maps/{standard}/{source}',
      get: {
        success: ({
          mockedResponse = {
            standard: 'standard',
            source: 'source',
            version: 'string',
            description: 'string',
            inherits: 'string',
            mappings: {
              additionalProp1: 'string',
              additionalProp2: 'string',
              additionalProp3: 'string',
            },
          },
          standard = 'standard',
          source = 'source',
        }: {
          mockedResponse?: TSourceFieldMapResponse;
          standard?: string;
          source?: string;
        } = {}) => {
          return http.get(
            API_CONFIG_MOCKS.fieldMaps.source.mockedUrl
              .replace('{standard}', standard)
              .replace('{source}', source),
            () => {
              return HttpResponse.json(mockedResponse);
            },
          );
        },
      },
      delete: {
        success: () => {
          console.error('Not implemented');
        },
      },
    },
    seed: {
      mockedUrl: '/api/v1/field-maps/seed',
      post: {
        success: () => {
          console.error('Not implemented');
        },
      },
    },
  },
  rules: {
    rule: {
      mockedUrl: '/api/v1/rules/{name}',
      get: {
        success: ({
          mockedResponse = {
            name: 'string',
            display_name: 'string',
            severity: 'string',
            source: 'string',
            source_db: 'string',
            source_table: 'string',
            where_clause: 'string',
            cel_filter: 'string',
            original_sql: 'string',
            hunt_name: 'string',
            created_at: 'string',
          },
          name = 'name',
        }: {
          mockedResponse?: TRuleDetail;
          name?: string;
        } = {}) => {
          return http.get(
            API_CONFIG_MOCKS.rules.rule.mockedUrl.replace('{name}', name),
            () => {
              return HttpResponse.json(mockedResponse);
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
          return http.get(
            API_CONFIG_MOCKS.rules.rule.mockedUrl.replace('{name}', name),
            () => {
              return HttpResponse.json(mockedResponse, { status });
            },
          );
        },
      },
      put: {
        success: ({
          mockedResponse = {
            rule: {
              name: 'string',
              display_name: 'string',
              severity: 'string',
              source_db: 'string',
              source_table: 'string',
              where_clause: 'string',
              cel_filter: 'string',
              original_sql: 'string',
              hunt_name: 'string',
              source: 'string',
              warnings: ['string'],
              created_at: 'string',
            },
            sanitize_summary: {
              additionalProp1: {},
            },

            sql_errors: [
              {
                message: 'string',
                position: 0,
                suggestion: 'string',
              },
            ],
            cost_estimate: {
              estimated_rows: 0,
              explain_plan: 'string',
              explain_duration_ms: 0,
              window_minutes: 60,
              warnings: ['string'],
            },
          },
          name = 'name',
        }: {
          mockedResponse?: TRuleUpdateResponse;
          name?: string;
        } = {}) => {
          return http.put(
            API_CONFIG_MOCKS.rules.rule.mockedUrl.replace('{name}', name),
            () => {
              return HttpResponse.json(mockedResponse);
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
          return http.put(
            API_CONFIG_MOCKS.rules.rule.mockedUrl.replace('{name}', name),
            () => {
              return HttpResponse.json(mockedResponse, { status });
            },
          );
        },
      },
      delete: {
        success: ({ name = 'name' }: { name?: string } = {}) => {
          return http.delete(
            API_CONFIG_MOCKS.rules.rule.mockedUrl.replace('{name}', name),
            () => {
              return HttpResponse.json({});
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
            API_CONFIG_MOCKS.rules.rule.mockedUrl.replace('{name}', name),
            () => {
              return HttpResponse.json(mockedResponse, { status });
            },
          );
        },
      },
    },
    default: {
      mockedUrl: '/api/v1/rules',
      get: {
        success: ({
          mockedResponse = {
            items: [
              {
                name: 'string',
                display_name: 'string',
                severity: 'string',
                source: 'string',
                source_db: 'string',
                source_table: 'string',
                hunt_name: 'string',
                created_at: 'string',
              },
            ],
            total: 0,
            page: 0,
            per_page: 0,
            total_pages: 0,
            next_page: 0,
            prev_page: 0,
          },
        }: {
          mockedResponse?: TRuleListResponse;
        } = {}) => {
          return http.get(API_CONFIG_MOCKS.rules.default.mockedUrl, () => {
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
          return http.get(API_CONFIG_MOCKS.rules.default.mockedUrl, () => {
            return HttpResponse.json(mockedResponse, { status });
          });
        },
      },
      post: {
        success: ({
          mockedResponse = {
            rule: {
              name: 'string',
              display_name: 'string',
              severity: 'string',
              source_db: 'string',
              source_table: 'string',
              where_clause: 'string',
              cel_filter: 'string',
              original_sql: 'string',
              hunt_name: 'string',
              source: 'string',
              warnings: ['string'],
              created_at: 'string',
            },
            sanitize_summary: {
              additionalProp1: {},
            },
            sql_errors: [
              {
                message: 'string',
                position: 0,
                suggestion: 'string',
              },
            ],
            cost_estimate: {
              estimated_rows: 0,
              explain_plan: 'string',
              explain_duration_ms: 0,
              window_minutes: 60,
              warnings: ['string'],
            },
          },
        }: {
          mockedResponse?: TRuleCreateResponse;
        } = {}) =>
          http.post(API_CONFIG_MOCKS.rules.default.mockedUrl, () => {
            return HttpResponse.json(mockedResponse);
          }),
        error: ({
          mockedResponse = DEFAULT_VALIDATION_ERROR,
          status = 422,
        }: {
          mockedResponse?: TValidationError;
          status?: number;
        } = {}) =>
          http.post(API_CONFIG_MOCKS.rules.default.mockedUrl, () => {
            return HttpResponse.json(mockedResponse, { status });
          }),
      },
    },
    validate: {
      mockedUrl: '/api/v1/rules/validate',
      post: {
        success: ({
          mockedResponse = {
            valid: true,
            errors: [
              {
                message: 'string',
                position: 0,
                suggestion: 'string',
              },
            ],
          },
        }: {
          mockedResponse?: TSqlValidationResponse;
        } = {}) =>
          http.post(API_CONFIG_MOCKS.rules.validate.mockedUrl, () => {
            return HttpResponse.json(mockedResponse);
          }),
        error: ({
          mockedResponse = DEFAULT_VALIDATION_ERROR,
          status = 422,
        }: {
          mockedResponse?: TValidationError;
          status?: number;
        } = {}) =>
          http.post(API_CONFIG_MOCKS.rules.validate.mockedUrl, () => {
            return HttpResponse.json(mockedResponse, { status });
          }),
      },
    },
  },
  alerts: {
    destinations: {
      mockedUrl: '/api/v1/alerts/destinations',
      get: {
        success: ({
          mockedResponse = {
            items: [
              {
                name: 'string',
                description: 'string',
                enabled: true,
                url_scheme: 'string',
              },
            ],
            total: 0,
            page: 0,
            per_page: 0,
            total_pages: 0,
            next_page: 0,
            prev_page: 0,
          },
        }: {
          mockedResponse?: TAlertListResponse;
        } = {}) => {
          return http.get(
            API_CONFIG_MOCKS.alerts.destinations.mockedUrl,
            () => {
              return HttpResponse.json(mockedResponse);
            },
          );
        },
        error: ({
          mockedResponse = DEFAULT_VALIDATION_ERROR,
          status = 422,
        }: {
          mockedResponse?: TValidationError;
          status?: number;
        } = {}) => {
          return http.get(
            API_CONFIG_MOCKS.alerts.destinations.mockedUrl,
            () => {
              return HttpResponse.json(mockedResponse, { status });
            },
          );
        },
      },
      post: {
        success: ({
          mockedResponse = {
            name: 'string',
            url: 'string',
            description: 'string',
            enabled: true,
          },
        }: {
          mockedResponse?: TAlertCreateResponse;
        } = {}) => {
          return http.post(
            API_CONFIG_MOCKS.alerts.destinations.mockedUrl,
            () => {
              return HttpResponse.json(mockedResponse);
            },
          );
        },
        error: ({
          mockedResponse = DEFAULT_VALIDATION_ERROR,
          status = 422,
        }: {
          mockedResponse?: TValidationError;
          status?: number;
        } = {}) => {
          return http.post(
            API_CONFIG_MOCKS.alerts.destinations.mockedUrl,
            () => {
              return HttpResponse.json(mockedResponse, { status });
            },
          );
        },
      },
    },
    destination: {
      mockedUrl: '/api/v1/alerts/destinations/{name}',
      get: {
        success: ({
          mockedResponse = {
            name: 'string',
            url: 'string',
            description: 'string',
            enabled: true,
          },
          name = 'name',
        }: {
          mockedResponse?: TAlertDetailResponse;
          name?: string;
        } = {}) => {
          return http.get(
            API_CONFIG_MOCKS.alerts.destination.mockedUrl.replace(
              '{name}',
              name,
            ),
            () => {
              return HttpResponse.json(mockedResponse);
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
          return http.get(
            API_CONFIG_MOCKS.alerts.destination.mockedUrl.replace(
              '{name}',
              name,
            ),
            () => {
              return HttpResponse.json(mockedResponse, { status });
            },
          );
        },
      },
      put: {
        success: ({
          mockedResponse = {
            name: 'string',
            url: 'string',
            description: 'string',
            enabled: true,
          },
          name = 'alert_name',
        }: {
          mockedResponse?: TAlertUpdateResponse;
          name?: string;
        } = {}) => {
          return http.put(
            API_CONFIG_MOCKS.alerts.destination.mockedUrl.replace(
              '{name}',
              name,
            ),
            () => {
              return HttpResponse.json(mockedResponse);
            },
          );
        },
        error: ({
          mockedResponse = DEFAULT_VALIDATION_ERROR,
          status = 422,
          name = 'alert_name',
        }: {
          mockedResponse?: TValidationError;
          status?: number;
          name?: string;
        } = {}) => {
          return http.put(
            API_CONFIG_MOCKS.alerts.destination.mockedUrl.replace(
              '{name}',
              name,
            ),
            () => {
              return HttpResponse.json(mockedResponse, { status });
            },
          );
        },
      },
      delete: {
        success: ({
          status = 204,
          name = 'alert_name',
        }: { status?: number; name?: string } = {}) => {
          return http.delete(
            API_CONFIG_MOCKS.alerts.destination.mockedUrl.replace(
              '{name}',
              name,
            ),
            () => {
              return HttpResponse.json({}, { status });
            },
          );
        },
        error: ({
          mockedResponse = DEFAULT_VALIDATION_ERROR,
          status = 422,
          name = 'alert_name',
        }: {
          mockedResponse?: TValidationError;
          status?: number;
          name?: string;
        } = {}) => {
          return http.delete(
            API_CONFIG_MOCKS.alerts.destination.mockedUrl.replace(
              '{name}',
              name,
            ),
            () => {
              return HttpResponse.json(mockedResponse, { status });
            },
          );
        },
      },
    },
  },
  system: {
    version: {
      mockedUrl: '/api/v1/system/version',
      get: {
        success: () => {
          console.error('Not implemented');
        },
      },
    },
    settings: {
      mockedUrl: '/api/v1/system/settings',
      get: {
        success: () => {
          console.error('Not implemented');
        },
      },
    },
  },
  transforms: {
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
          return http.post(
            API_CONFIG_MOCKS.transforms.compile.mockedUrl,
            () => {
              return HttpResponse.json(mockedResponse);
            },
          );
        },
        error: ({
          mockedResponse = DEFAULT_VALIDATION_ERROR,
          status = 422,
        }: {
          mockedResponse?: TValidationError;
          status?: number;
        } = {}) => {
          return http.post(
            API_CONFIG_MOCKS.transforms.compile.mockedUrl,
            () => {
              return HttpResponse.json(mockedResponse, { status });
            },
          );
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
          return http.post(API_CONFIG_MOCKS.transforms.test.mockedUrl, () => {
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
          return http.post(API_CONFIG_MOCKS.transforms.test.mockedUrl, () => {
            return HttpResponse.json(mockedResponse, { status });
          });
        },
      },
    },
  },
  schemas: {
    default: {
      mockedUrl: '/api/v1/schemas',
      get: {
        success: ({
          mockedResponse = {
            items: [
              {
                name: 'string',
                current: 'string',
                versions: ['string'],
                updated_at: 'string',
                column_count: 0,
                resource_type: RESOURCE_TYPES.CORE,
              },
            ],
            total: 0,
            page: 0,
            per_page: 0,
            total_pages: 0,
            next_page: 0,
            prev_page: 0,
            objects: {
              items: [],
              children: {
                string: {
                  items: [],
                  children: {},
                },
              },
            },
          },
        }: {
          mockedResponse?: TSchemaListResponse;
        } = {}) => {
          return http.get(API_CONFIG_MOCKS.schemas.default.mockedUrl, () => {
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
          return http.get(API_CONFIG_MOCKS.schemas.default.mockedUrl, () => {
            return HttpResponse.json(mockedResponse, { status });
          });
        },
      },
    },
    schemaVersions: {
      mockedUrl: '/api/v1/schemas/definitions/{schema_path}/versions',
      post: {
        success: ({
          mockedResponse = {
            path: 'string',
            current: 'string',
            versions: ['string'],
          },
          schema_path = 'path',
        }: {
          mockedResponse?: TSchemaCreateVersionResponse;
          schema_path?: string;
        } = {}) => {
          return http.post(
            API_CONFIG_MOCKS.schemas.schemaVersions.mockedUrl.replace(
              '{schema_path}',
              schema_path,
            ),
            () => {
              return HttpResponse.json(mockedResponse);
            },
          );
        },
        error: ({
          mockedResponse = DEFAULT_VALIDATION_ERROR,
          status = 422,
          schema_path = 'path',
        }: {
          mockedResponse?: TValidationError;
          status?: number;
          schema_path?: string;
        } = {}) => {
          return http.post(
            API_CONFIG_MOCKS.schemas.schemaVersions.mockedUrl.replace(
              '{schema_path}',
              schema_path,
            ),
            () => {
              return HttpResponse.json(mockedResponse, { status });
            },
          );
        },
      },
    },
    schema: {
      mockedUrl: '/api/v1/schemas/definitions/{schema_path}',
      post: {
        success: ({
          mockedResponse = {
            path: 'string',
            current: 'string',
            resource_type: RESOURCE_TYPES.CORE,
            versions: {
              string: {
                date: 'string',
                type: 'string',
                summary: 'string',
                columns: [
                  {
                    name: 'string',
                    type: 'string',
                    attribute: ['string'],
                    use_case: 'string',
                    expr: 'string',
                    _field_type: SCHEMA_FIELD_TYPES.BASE,
                  },
                ],
              },
            },
          },
          schema_path = 'path',
        }: {
          mockedResponse?: TCreateSchemaResponse;
          schema_path?: string;
        } = {}) => {
          return http.post(
            API_CONFIG_MOCKS.schemas.schema.mockedUrl.replace(
              '{schema_path}',
              schema_path,
            ),
            () => {
              return HttpResponse.json(mockedResponse);
            },
          );
        },
        error: ({
          mockedResponse = DEFAULT_VALIDATION_ERROR,
          status = 422,
          schema_path = 'path',
        }: {
          mockedResponse?: TValidationError;
          status?: number;
          schema_path?: string;
        } = {}) => {
          return http.post(
            API_CONFIG_MOCKS.schemas.schema.mockedUrl.replace(
              '{schema_path}',
              schema_path,
            ),
            () => {
              return HttpResponse.json(mockedResponse, { status });
            },
          );
        },
      },
      patch: {
        success: ({
          mockedResponse = {
            path: 'string',
            current: 'string',
            versions: ['string'],
          },
          schema_path = 'path',
        }: {
          mockedResponse?: TMetaSchemaUpdateResponse;
          schema_path?: string;
        } = {}) => {
          return http.patch(
            API_CONFIG_MOCKS.schemas.schema.mockedUrl.replace(
              '{schema_path}',
              schema_path,
            ),
            () => {
              return HttpResponse.json(mockedResponse);
            },
          );
        },
        error: ({
          mockedResponse = DEFAULT_VALIDATION_ERROR,
          status = 422,
          schema_path = 'path',
        }: {
          mockedResponse?: TValidationError;
          status?: number;
          schema_path?: string;
        } = {}) => {
          return http.patch(
            API_CONFIG_MOCKS.schemas.schema.mockedUrl.replace(
              '{schema_path}',
              schema_path,
            ),
            () => {
              return HttpResponse.json(mockedResponse, { status });
            },
          );
        },
      },
      delete: {
        success: ({
          status = 204,
          schema_path = 'path',
        }: { status?: number; schema_path?: string } = {}) => {
          return http.delete(
            API_CONFIG_MOCKS.schemas.schema.mockedUrl.replace(
              '{schema_path}',
              schema_path,
            ),
            () => {
              return HttpResponse.json({}, { status });
            },
          );
        },
        error: ({
          mockedResponse = DEFAULT_VALIDATION_ERROR,
          status = 422,
          schema_path = 'path',
        }: {
          mockedResponse?: TValidationError;
          status?: number;
          schema_path?: string;
        } = {}) => {
          return http.delete(
            API_CONFIG_MOCKS.schemas.schema.mockedUrl.replace(
              '{schema_path}',
              schema_path,
            ),
            () => {
              return HttpResponse.json(mockedResponse, { status });
            },
          );
        },
      },
    },
    schemaDetail: {
      mockedUrl: '/api/v1/schemas/definitions/{schema_path}/versions/columns',
      get: {
        success: ({
          mockedResponse = {
            path: 'string',
            current: 'string',
            selected: 'string',
            versions: ['1.0.0'],
            resource_type: RESOURCE_TYPES.CORE,
            version: {
              date: 'string',
              type: 'string',
              summary: 'string',
              columns: {
                items: [
                  {
                    name: 'string',
                    type: 'string',
                    attribute: ['string'],
                    use_case: 'string',
                    expr: 'string',
                    _field_type: SCHEMA_FIELD_TYPES.BASE,
                  },
                ],
                total: 1,
                page: 1,
                per_page: 25,
                total_pages: 1,
                next_page: null,
                prev_page: null,
              },
            },
          },
          schema_path = 'path',
        }: {
          mockedResponse?: TMetaSchemaDetailResponse;
          schema_path?: string;
        } = {}) => {
          return http.get(
            API_CONFIG_MOCKS.schemas.schemaDetail.mockedUrl.replace(
              '{schema_path}',
              schema_path,
            ),
            () => {
              return HttpResponse.json(mockedResponse);
            },
          );
        },
        error: ({
          mockedResponse = DEFAULT_VALIDATION_ERROR,
          status = 422,
          schema_path = 'path',
        }: {
          mockedResponse?: TValidationError;
          status?: number;
          schema_path?: string;
        } = {}) => {
          return http.get(
            API_CONFIG_MOCKS.schemas.schemaDetail.mockedUrl.replace(
              '{schema_path}',
              schema_path,
            ),
            () => {
              return HttpResponse.json(mockedResponse, { status });
            },
          );
        },
      },
    },
    elasticConvert: {
      mockedUrl: '/api/v1/schemas/elastic-converter',
      post: {
        success: ({
          mockedResponse = [
            {
              name: 'string',
              type: 'string',
              attribute: ['string'],
              use_case: 'string',
              expr: 'string',
              _field_type: SCHEMA_FIELD_TYPES.ELASTIC_IMPORT,
            },
          ],
        }: {
          mockedResponse?: TElasticConvertResponse;
        } = {}) => {
          return http.post(
            API_CONFIG_MOCKS.schemas.elasticConvert.mockedUrl,
            () => {
              return HttpResponse.json(mockedResponse);
            },
          );
        },
        error: ({
          mockedResponse = DEFAULT_VALIDATION_ERROR,
          status = 422,
        }: {
          mockedResponse?: TValidationError;
          status?: number;
        } = {}) => {
          return http.post(
            API_CONFIG_MOCKS.schemas.elasticConvert.mockedUrl,
            () => {
              return HttpResponse.json(mockedResponse, { status });
            },
          );
        },
      },
    },
    sampleRows: {
      mockedUrl: '/api/v1/schemas/{source_name}/sample-rows',
      get: {
        success: ({
          mockedResponse = {
            source_name: 'source',
            table: 'string',
            match_field: 'string',
            match_value: 'string',
            columns: ['string'],
            rows: [{ string: 'string' }],
          },
          source_name = 'source',
        }: {
          mockedResponse?: TSampleRowsResponse;
          source_name?: string;
        } = {}) => {
          return http.get(
            API_CONFIG_MOCKS.schemas.sampleRows.mockedUrl.replace(
              '{source_name}',
              source_name,
            ),
            () => {
              return HttpResponse.json(mockedResponse);
            },
          );
        },
      },
    },
    jsonPaths: {
      mockedUrl: '/api/v1/schemas/{source_name}/json-paths',
      get: {
        success: ({
          mockedResponse = {
            source_name: 'source',
            table: 'string',
            json_column: 'string',
            paths: [
              {
                path: 'string',
                types: ['string'],
                is_consistent: true,
                promoted_to: 'string',
                column: {
                  name: 'string',
                  type: 'string',
                  attribute: ['string'],
                  use_case: 'string',
                  expr: 'string',
                  comment: 'string',
                  _field_type: SCHEMA_FIELD_TYPES.PROMOTED,
                },
                coverage_pct: 100,
              },
            ],
          },
          source_name = 'source',
        }: {
          mockedResponse?: TJsonPathsResponse;
          source_name?: string;
        } = {}) => {
          return http.get(
            API_CONFIG_MOCKS.schemas.jsonPaths.mockedUrl.replace(
              '{source_name}',
              source_name,
            ),
            () => {
              return HttpResponse.json(mockedResponse);
            },
          );
        },
      },
    },
    promoteField: {
      mockedUrl: '/api/v1/schemas/{source_name}/promote-field',
      post: {
        success: ({
          mockedResponse = {
            source_name: 'source',
            schema_version: 'string',
            results: [
              {
                json_path: 'string',
                status: 'ok',
                column_name: 'string',
                data_type: 'string',
                index_type: 'string',
                copy_cel: 'string',
                error: 'string',
              },
            ],
          },
          source_name = 'source',
        }: {
          mockedResponse?: TPromoteFieldResponse;
          source_name?: string;
        } = {}) => {
          return http.post(
            API_CONFIG_MOCKS.schemas.promoteField.mockedUrl.replace(
              '{source_name}',
              source_name,
            ),
            () => {
              return HttpResponse.json(mockedResponse);
            },
          );
        },
        error: ({
          mockedResponse = DEFAULT_VALIDATION_ERROR,
          status = 422,
          source_name = 'source',
        }: {
          mockedResponse?: TValidationError;
          status?: number;
          source_name?: string;
        } = {}) => {
          return http.post(
            API_CONFIG_MOCKS.schemas.promoteField.mockedUrl.replace(
              '{source_name}',
              source_name,
            ),
            () => {
              return HttpResponse.json(mockedResponse, { status });
            },
          );
        },
      },
    },
  },
  orgs: {
    default: {
      mockedUrl: '/api/v1/orgs',
      get: {
        success: ({
          mockedResponse = {
            items: [
              {
                name: 'string',
                display_name: 'string',
                org_ids: ['string'],
                enabled: true,
                created_at: 'string',
                updated_at: 'string',
              },
            ],
            total: 1,
            page: 1,
            per_page: 10,
            total_pages: 1,
            next_page: 1,
            prev_page: 1,
          },
        }: {
          mockedResponse?: TOrganisationListResponse;
        } = {}) => {
          return http.get(API_CONFIG_MOCKS.orgs.default.mockedUrl, () => {
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
          return http.get(API_CONFIG_MOCKS.orgs.default.mockedUrl, () => {
            return HttpResponse.json(mockedResponse, { status });
          });
        },
      },
      post: {
        success: ({
          mockedResponse = {
            name: 'org_name',
            display_name: 'string',
            org_ids: ['string'],
            enabled: true,
            created_at: 'string',
            updated_at: 'string',
          },
        }: {
          mockedResponse?: TOrganisationCreateResponse;
        } = {}) => {
          return http.post(API_CONFIG_MOCKS.orgs.default.mockedUrl, () => {
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
          return http.post(API_CONFIG_MOCKS.orgs.default.mockedUrl, () => {
            return HttpResponse.json(mockedResponse, { status });
          });
        },
      },
    },
    org: {
      mockedUrl: '/api/v1/orgs/{name}',
      get: {
        success: ({
          mockedResponse = {
            name: 'org_name',
            display_name: 'string',
            org_ids: ['string'],
            enabled: true,
            created_at: 'string',
            updated_at: 'string',
          },
          org_name = 'org_name',
        }: {
          mockedResponse?: TOrganisationDetail;
          org_name?: string;
        } = {}) => {
          return http.get(
            API_CONFIG_MOCKS.orgs.org.mockedUrl.replace('{name}', org_name),
            () => {
              return HttpResponse.json(mockedResponse);
            },
          );
        },
        error: ({
          mockedResponse = DEFAULT_VALIDATION_ERROR,
          status = 422,
          org_name = 'org_name',
        }: {
          mockedResponse?: TValidationError;
          status?: number;
          org_name?: string;
        } = {}) => {
          return http.get(
            API_CONFIG_MOCKS.orgs.org.mockedUrl.replace('{name}', org_name),
            () => {
              return HttpResponse.json(mockedResponse, { status });
            },
          );
        },
      },
      put: {
        success: ({
          mockedResponse = {
            name: 'org_name',
            display_name: 'string',
            org_ids: ['string'],
            enabled: true,
            created_at: 'string',
            updated_at: 'string',
          },
          org_name = 'org_name',
        }: {
          mockedResponse?: TOrganisationUpdateResponse;
          org_name?: string;
        } = {}) => {
          return http.put(
            API_CONFIG_MOCKS.orgs.org.mockedUrl.replace('{name}', org_name),
            () => {
              return HttpResponse.json(mockedResponse);
            },
          );
        },
        error: ({
          mockedResponse = DEFAULT_VALIDATION_ERROR,
          status = 422,
          org_name = 'org_name',
        }: {
          mockedResponse?: TValidationError;
          status?: number;
          org_name?: string;
        } = {}) => {
          return http.put(
            API_CONFIG_MOCKS.orgs.org.mockedUrl.replace('{name}', org_name),
            () => {
              return HttpResponse.json(mockedResponse, { status });
            },
          );
        },
      },
      delete: {
        success: ({
          status = 204,
          org_name = 'org_name',
        }: { status?: number; org_name?: string } = {}) => {
          return http.delete(
            API_CONFIG_MOCKS.orgs.org.mockedUrl.replace('{name}', org_name),
            () => {
              return HttpResponse.json({}, { status });
            },
          );
        },
        error: ({
          mockedResponse = DEFAULT_VALIDATION_ERROR,
          status = 422,
          org_name = 'org_name',
        }: {
          mockedResponse?: TValidationError;
          status?: number;
          org_name?: string;
        } = {}) => {
          return http.delete(
            API_CONFIG_MOCKS.orgs.org.mockedUrl.replace('{name}', org_name),
            () => {
              return HttpResponse.json(mockedResponse, { status });
            },
          );
        },
      },
    },
  },
  groups: {
    default: {
      mockedUrl: '/api/v1/auth/groups',
      get: {
        success: ({
          mockedResponse = {
            items: [
              {
                name: 'string',
                description: 'string',
                roles: ['string'],
                members: ['string'],
                scope: 'string',
              },
            ],
            total: 25,
            page: 1,
            per_page: 10,
            total_pages: 3,
            next_page: 2,
            prev_page: 0,
          },
        }: {
          mockedResponse?: TGroupsResponse;
        } = {}) => {
          return http.get(API_CONFIG_MOCKS.groups.default.mockedUrl, () => {
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
          return http.get(API_CONFIG_MOCKS.groups.default.mockedUrl, () => {
            return HttpResponse.json(mockedResponse, { status });
          });
        },
      },
      post: {
        success: ({
          mockedResponse = {
            name: 'group_name',
            description: 'string',
            roles: ['string'],
            members: ['string'],
            scope: 'string',
          },
        }: {
          mockedResponse?: TGroupCreateResponse;
        } = {}) => {
          return http.post(API_CONFIG_MOCKS.groups.default.mockedUrl, () => {
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
          return http.post(API_CONFIG_MOCKS.groups.default.mockedUrl, () => {
            return HttpResponse.json(mockedResponse, { status });
          });
        },
      },
    },
    group: {
      mockedUrl: '/api/v1/auth/groups/{name}',
      get: {
        success: ({
          mockedResponse = {
            name: 'group_name',
            description: 'string',
            roles: ['string'],
            members: ['string'],
            scope: 'string',
          },
          group_name = 'group_name',
        }: {
          mockedResponse?: TGroupDetailResponse;
          group_name?: string;
        } = {}) => {
          return http.get(
            API_CONFIG_MOCKS.groups.group.mockedUrl.replace(
              '{name}',
              group_name,
            ),
            () => {
              return HttpResponse.json(mockedResponse);
            },
          );
        },
        error: ({
          mockedResponse = DEFAULT_VALIDATION_ERROR,
          status = 422,
          group_name = 'group_name',
        }: {
          mockedResponse?: TValidationError;
          status?: number;
          group_name?: string;
        } = {}) => {
          return http.get(
            API_CONFIG_MOCKS.groups.group.mockedUrl.replace(
              '{name}',
              group_name,
            ),
            () => {
              return HttpResponse.json(mockedResponse, { status });
            },
          );
        },
      },
      put: {
        success: ({
          mockedResponse = {
            name: 'group_name',
            description: 'string',
            roles: ['string'],
            members: ['string'],
            scope: 'string',
          },
          group_name = 'group_name',
        }: {
          mockedResponse?: TGroupUpdateResponse;
          group_name?: string;
        } = {}) => {
          return http.put(
            API_CONFIG_MOCKS.groups.group.mockedUrl.replace(
              '{name}',
              group_name,
            ),
            () => {
              return HttpResponse.json(mockedResponse);
            },
          );
        },
        error: ({
          mockedResponse = DEFAULT_VALIDATION_ERROR,
          status = 422,
          group_name = 'group_name',
        }: {
          mockedResponse?: TValidationError;
          status?: number;
          group_name?: string;
        } = {}) => {
          return http.put(
            API_CONFIG_MOCKS.groups.group.mockedUrl.replace(
              '{name}',
              group_name,
            ),
            () => {
              return HttpResponse.json(mockedResponse, { status });
            },
          );
        },
      },
      delete: {
        success: ({
          status = 204,
          group_name = 'group_name',
        }: { status?: number; group_name?: string } = {}) => {
          return http.delete(
            API_CONFIG_MOCKS.groups.group.mockedUrl.replace(
              '{name}',
              group_name,
            ),
            () => {
              return HttpResponse.json({}, { status });
            },
          );
        },
        error: ({
          mockedResponse = DEFAULT_VALIDATION_ERROR,
          status = 422,
          group_name = 'group_name',
        }: {
          mockedResponse?: TValidationError;
          status?: number;
          group_name?: string;
        } = {}) => {
          return http.delete(
            API_CONFIG_MOCKS.groups.group.mockedUrl.replace(
              '{name}',
              group_name,
            ),
            () => {
              return HttpResponse.json(mockedResponse, { status });
            },
          );
        },
      },
    },
    groupMembers: {
      mockedUrl: '/api/v1/auth/groups/{name}/members',
      get: {
        success: () => {
          console.error('Not implemented');
        },
      },
      post: {
        success: ({
          mockedResponse = {
            name: 'group_name',
            description: 'string',
            roles: ['string'],
            members: ['string'],
            scope: 'string',
          },
          group_name = 'group_name',
        }: {
          mockedResponse?: TAddGroupMemberResponse;
          group_name?: string;
        } = {}) => {
          return http.post(
            API_CONFIG_MOCKS.groups.groupMembers.mockedUrl.replace(
              '{name}',
              group_name,
            ),
            () => {
              return HttpResponse.json(mockedResponse);
            },
          );
        },
        error: ({
          mockedResponse = DEFAULT_VALIDATION_ERROR,
          status = 422,
          group_name = 'group_name',
        }: {
          mockedResponse?: TValidationError;
          status?: number;
          group_name?: string;
        } = {}) => {
          return http.post(
            API_CONFIG_MOCKS.groups.groupMembers.mockedUrl.replace(
              '{name}',
              group_name,
            ),
            () => {
              return HttpResponse.json(mockedResponse, { status });
            },
          );
        },
      },
    },
    groupMember: {
      mockedUrl: '/api/v1/auth/groups/{name}/members/{username}',
      get: {
        success: () => {
          console.error('Not implemented');
        },
      },
      delete: {
        success: ({
          mockedResponse = {
            name: 'group_name',
            description: 'string',
            roles: ['string'],
            members: ['string'],
            scope: 'string',
          },
          group_name = 'group_name',
          username = 'string',
        }: {
          mockedResponse?: TRemoveGroupMemberResponse;
          group_name?: string;
          username?: string;
        } = {}) => {
          return http.delete(
            API_CONFIG_MOCKS.groups.groupMember.mockedUrl
              .replace('{name}', group_name)
              .replace('{username}', username),
            () => {
              return HttpResponse.json(mockedResponse);
            },
          );
        },
        error: ({
          mockedResponse = DEFAULT_VALIDATION_ERROR,
          status = 422,
          group_name = 'group_name',
          username = 'string',
        }: {
          mockedResponse?: TValidationError;
          status?: number;
          group_name?: string;
          username?: string;
        } = {}) => {
          return http.delete(
            API_CONFIG_MOCKS.groups.groupMember.mockedUrl
              .replace('{name}', group_name)
              .replace('{username}', username),
            () => {
              return HttpResponse.json(mockedResponse, { status });
            },
          );
        },
      },
    },
  },
  accounts: {
    default: {
      mockedUrl: '/api/v1/auth/accounts',
      get: {
        success: ({
          mockedResponse = {
            items: [
              {
                username: 'string',
                enabled: true,
                groups: ['string'],
                created_at: 'string',
                updated_at: 'string',
              },
            ],
            total: 1,
            page: 1,
            per_page: 10,
            total_pages: 1,
            next_page: 1,
            prev_page: 1,
          },
        }: {
          mockedResponse?: TAccountsResponse;
        } = {}) => {
          return http.get(API_CONFIG_MOCKS.accounts.default.mockedUrl, () => {
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
          return http.get(API_CONFIG_MOCKS.accounts.default.mockedUrl, () => {
            return HttpResponse.json(mockedResponse, { status });
          });
        },
      },
      post: {
        success: ({
          mockedResponse = {
            username: 'string',
            enabled: true,
            groups: ['string'],
            created_at: 'string',
            updated_at: 'string',
          },
        }: {
          mockedResponse?: TAccountCreateResponse;
        } = {}) => {
          return http.post(API_CONFIG_MOCKS.accounts.default.mockedUrl, () => {
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
          return http.post(API_CONFIG_MOCKS.accounts.default.mockedUrl, () => {
            return HttpResponse.json(mockedResponse, { status });
          });
        },
      },
    },
    account: {
      mockedUrl: '/api/v1/auth/accounts/{username}',
      get: {
        success: ({
          mockedResponse = {
            username: 'string',
            enabled: true,
            groups: ['string'],
            created_at: 'string',
            updated_at: 'string',
          },
          username = 'string',
        }: {
          mockedResponse?: TAccountDetailResponse;
          username?: string;
        } = {}) => {
          return http.get(
            API_CONFIG_MOCKS.accounts.account.mockedUrl.replace(
              '{username}',
              username,
            ),
            () => {
              return HttpResponse.json(mockedResponse);
            },
          );
        },
        error: ({
          mockedResponse = DEFAULT_VALIDATION_ERROR,
          status = 422,
          username = 'string',
        }: {
          mockedResponse?: TValidationError;
          status?: number;
          username?: string;
        } = {}) => {
          return http.get(
            API_CONFIG_MOCKS.accounts.account.mockedUrl.replace(
              '{username}',
              username,
            ),
            () => {
              return HttpResponse.json(mockedResponse, { status });
            },
          );
        },
      },
      put: {
        success: ({
          mockedResponse = {
            username: 'string',
            enabled: true,
            groups: ['string'],
            created_at: 'string',
            updated_at: 'string',
          },
          username = 'string',
        }: {
          mockedResponse?: TAccountUpdateResponse;
          username?: string;
        } = {}) => {
          return http.put(
            API_CONFIG_MOCKS.accounts.account.mockedUrl.replace(
              '{username}',
              username,
            ),
            () => {
              return HttpResponse.json(mockedResponse);
            },
          );
        },
        error: ({
          mockedResponse = DEFAULT_VALIDATION_ERROR,
          status = 422,
          username = 'string',
        }: {
          mockedResponse?: TValidationError;
          status?: number;
          username?: string;
        } = {}) => {
          return http.put(
            API_CONFIG_MOCKS.accounts.account.mockedUrl.replace(
              '{username}',
              username,
            ),
            () => {
              return HttpResponse.json(mockedResponse, { status });
            },
          );
        },
      },
      delete: {
        success: ({
          status = 204,
          username = 'string',
        }: { status?: number; username?: string } = {}) => {
          return http.delete(
            API_CONFIG_MOCKS.accounts.account.mockedUrl.replace(
              '{username}',
              username,
            ),
            () => {
              return HttpResponse.json({}, { status });
            },
          );
        },
        error: ({
          mockedResponse = DEFAULT_VALIDATION_ERROR,
          status = 422,
          username = 'string',
        }: {
          mockedResponse?: TValidationError;
          status?: number;
          username?: string;
        } = {}) => {
          return http.delete(
            API_CONFIG_MOCKS.accounts.account.mockedUrl.replace(
              '{username}',
              username,
            ),
            () => {
              return HttpResponse.json(mockedResponse, { status });
            },
          );
        },
      },
    },
    resetPassword: {
      mockedUrl: '/api/v1/auth/accounts/{username}/reset-password',
      post: {
        success: ({
          mockedResponse = {},
          username = 'string',
        }: {
          mockedResponse?: TAccountResetPasswordResponse;
          username?: string;
        } = {}) => {
          return http.post(
            API_CONFIG_MOCKS.accounts.resetPassword.mockedUrl.replace(
              '{username}',
              username,
            ),
            () => {
              return HttpResponse.json(JSON.stringify(mockedResponse));
            },
          );
        },
        error: ({
          mockedResponse = DEFAULT_VALIDATION_ERROR,
          status = 422,
          username = 'string',
        }: {
          mockedResponse?: TValidationError;
          status?: number;
          username?: string;
        } = {}) => {
          return http.post(
            API_CONFIG_MOCKS.accounts.resetPassword.mockedUrl.replace(
              '{username}',
              username,
            ),
            () => {
              return HttpResponse.json(mockedResponse, { status });
            },
          );
        },
      },
    },
  },
  roles: {
    default: {
      mockedUrl: '/api/v1/auth/roles',
      get: {
        success: ({
          mockedResponse = {
            items: [
              {
                name: 'string',
                description: 'string',
                permissions: ['string'],
                scoped: false,
                resource_type: 'string',
              },
            ],
            total: 0,
            page: 0,
            per_page: 0,
            total_pages: 0,
            next_page: 0,
            prev_page: 0,
          },
        }: {
          mockedResponse?: TRoleListResponse;
        } = {}) => {
          return http.get(API_CONFIG_MOCKS.roles.default.mockedUrl, () => {
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
          return http.get(API_CONFIG_MOCKS.roles.default.mockedUrl, () => {
            return HttpResponse.json(mockedResponse, { status });
          });
        },
      },
      post: {
        success: ({
          mockedResponse = {
            name: 'string',
            description: 'string',
            permissions: ['string'],
            scoped: false,
            resource_type: 'string',
          },
        }: {
          mockedResponse?: TRoleCreateResponse;
        } = {}) => {
          return http.post(API_CONFIG_MOCKS.roles.default.mockedUrl, () => {
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
          return http.post(API_CONFIG_MOCKS.roles.default.mockedUrl, () => {
            return HttpResponse.json(mockedResponse, { status });
          });
        },
      },
    },
    role: {
      mockedUrl: '/api/v1/auth/roles/{name}',
      get: {
        success: ({
          mockedResponse = {
            name: 'string',
            description: 'string',
            permissions: ['string'],
            scoped: false,
            resource_type: 'string',
          },
          role_name = 'role_name',
        }: {
          mockedResponse?: TRoleDetail;
          role_name?: string;
        } = {}) => {
          return http.get(
            API_CONFIG_MOCKS.roles.role.mockedUrl.replace('{name}', role_name),
            () => {
              return HttpResponse.json(mockedResponse);
            },
          );
        },
      },
      put: {
        success: ({
          mockedResponse = {
            name: 'string',
            description: 'string',
            permissions: ['string'],
            scoped: false,
            resource_type: 'string',
          },
          role_name = 'role_name',
        }: {
          mockedResponse?: TRoleUpdateResponse;
          role_name?: string;
        } = {}) => {
          return http.put(
            API_CONFIG_MOCKS.roles.role.mockedUrl.replace('{name}', role_name),
            () => {
              return HttpResponse.json(mockedResponse);
            },
          );
        },
        error: ({
          mockedResponse = DEFAULT_VALIDATION_ERROR,
          status = 422,
          role_name = 'role_name',
        }: {
          mockedResponse?: TValidationError;
          status?: number;
          role_name?: string;
        } = {}) => {
          return http.put(
            API_CONFIG_MOCKS.roles.role.mockedUrl.replace('{name}', role_name),
            () => {
              return HttpResponse.json(mockedResponse, { status });
            },
          );
        },
      },
      delete: {
        success: ({
          status = 204,
          role_name = 'role_name',
        }: { status?: number; role_name?: string } = {}) => {
          return http.delete(
            API_CONFIG_MOCKS.roles.role.mockedUrl.replace('{name}', role_name),
            () => {
              return HttpResponse.json({}, { status });
            },
          );
        },
        error: ({
          mockedResponse = DEFAULT_VALIDATION_ERROR,
          status = 422,
          role_name = 'role_name',
        }: {
          mockedResponse?: TValidationError;
          status?: number;
          role_name?: string;
        } = {}) => {
          return http.delete(
            API_CONFIG_MOCKS.roles.role.mockedUrl.replace('{name}', role_name),
            () => {
              return HttpResponse.json(mockedResponse, { status });
            },
          );
        },
      },
    },
    scopes: {
      mockedUrl: '/api/v1/auth/roles/scopes',
      get: {
        success: ({
          mockedResponse = {
            scopes: ['string'],
            total: 0,
            page: 0,
            per_page: 0,
            total_pages: 0,
            wildcard: false,
            argo_namespace_prefix: 'string',
            notes: 'string',
          },
        }: {
          mockedResponse?: TRoleScopesResponse;
        } = {}) => {
          return http.get(API_CONFIG_MOCKS.roles.scopes.mockedUrl, () => {
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
          return http.get(API_CONFIG_MOCKS.roles.scopes.mockedUrl, () => {
            return HttpResponse.json(mockedResponse, { status });
          });
        },
      },
    },
  },
  hunts: {
    default: {
      mockedUrl: '/api/v1/hunts',
      get: {
        success: ({
          mockedResponse = {
            items: [
              {
                display_name: 'string',
                name: 'string',
                source_table: 'string',
                target_table: 'string',
                customer: 'string',
                cron: 'string',
                rules: ['string'],
              },
            ],
            total: 0,
            page: 0,
            per_page: 0,
            total_pages: 0,
            next_page: 0,
            prev_page: 0,
          },
        }: {
          mockedResponse?: THuntListResponse;
        } = {}) => {
          return http.get(API_CONFIG_MOCKS.hunts.default.mockedUrl, () => {
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
          return http.get(API_CONFIG_MOCKS.hunts.default.mockedUrl, () => {
            return HttpResponse.json(mockedResponse, { status });
          });
        },
      },
      post: {
        success: ({
          mockedResponse = {
            display_name: 'string',
            name: 'string',
            cron: 'string',
            log_buffer: 0,
            global_target_table_name: 'string',
            global_source_table_name: 'string',
            customers: ['string'],
            rules: [
              {
                rule_name: 'string',
                target_table_name: 'string',
                source: 'string',
                initial_checkpoint_lookback_minutes: 0,
              },
            ],
            customer_filters: {
              string: {
                filters: ['string'],
              },
            },
            checkpoint_timestamp_field: 'string',
            scheduling_mode: 'string',
            min_interval_seconds: 0,
            explain_queries: false,
          },
        }: {
          mockedResponse?: THuntCreateResponse;
        } = {}) => {
          return http.post(API_CONFIG_MOCKS.hunts.default.mockedUrl, () => {
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
          return http.post(API_CONFIG_MOCKS.hunts.default.mockedUrl, () => {
            return HttpResponse.json(mockedResponse, { status });
          });
        },
      },
    },
    engineStatus: {
      mockedUrl: '/api/v1/hunts/status',
      get: {
        success: ({
          mockedResponse = {
            running: true,
            hunt_count: 1,
            scheduling_mode: 'string',
          },
        }: {
          mockedResponse?: THuntEngineStatus;
        } = {}) => {
          return http.get(API_CONFIG_MOCKS.hunts.engineStatus.mockedUrl, () => {
            return HttpResponse.json(mockedResponse);
          });
        },
      },
    },
    hunt: {
      mockedUrl: '/api/v1/hunts/{name}',
      get: {
        success: ({
          mockedResponse = {
            display_name: 'string',
            name: 'string',
            cron: 'string',
            log_buffer: 0,
            global_target_table_name: 'string',
            global_source_table_name: 'string',
            customers: ['string'],
            rules: [
              {
                rule_name: 'string',
                target_table_name: 'string',
                source: 'string',
                initial_checkpoint_lookback_minutes: 0,
              },
            ],
            customer_filters: {
              string: {
                filters: ['string'],
              },
            },
            checkpoint_timestamp_field: 'string',
            scheduling_mode: 'string',
            min_interval_seconds: 0,
          },
          name = 'name',
        }: {
          mockedResponse?: THuntDetailResponse;
          name?: string;
        } = {}) => {
          return http.get(
            API_CONFIG_MOCKS.hunts.hunt.mockedUrl.replace('{name}', name),
            () => {
              return HttpResponse.json(mockedResponse);
            },
          );
        },
      },
      put: {
        success: ({
          mockedResponse = {
            name: 'string',
            display_name: 'string',
            cron: 'string',
            log_buffer: 0,
            global_target_table_name: 'string',
            global_source_table_name: 'string',
            customers: ['string'],
            rules: [
              {
                rule_name: 'string',
                target_table_name: 'string',
                source: 'string',
                initial_checkpoint_lookback_minutes: 0,
              },
            ],
            customer_filters: {
              string: {
                filters: ['string'],
              },
            },
            checkpoint_timestamp_field: 'string',
            scheduling_mode: 'string',
            min_interval_seconds: 0,
          },
          name = 'name',
        }: {
          mockedResponse?: THuntDetailResponse;
          name?: string;
        } = {}) => {
          return http.put(
            API_CONFIG_MOCKS.hunts.hunt.mockedUrl.replace('{name}', name),
            () => {
              return HttpResponse.json(mockedResponse);
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
          return http.put(
            API_CONFIG_MOCKS.hunts.hunt.mockedUrl.replace('{name}', name),
            () => {
              return HttpResponse.json(mockedResponse, { status });
            },
          );
        },
      },
      delete: {
        success: ({
          status = 204,
          name = 'name',
        }: { status?: number; name?: string } = {}) => {
          return http.delete(
            API_CONFIG_MOCKS.hunts.hunt.mockedUrl.replace('{name}', name),
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
            API_CONFIG_MOCKS.hunts.hunt.mockedUrl.replace('{name}', name),
            () => {
              return HttpResponse.json(mockedResponse, { status });
            },
          );
        },
      },
    },
    huntRun: {
      mockedUrl: '/api/v1/hunts/{name}/run',
      post: {
        success: ({
          mockedResponse = {
            task_id: 'string',
            hunt_name: 'string',
          },
          name = 'name',
        }: {
          mockedResponse?: TTriggerResponse;
          name?: string;
        } = {}) => {
          return http.post(
            API_CONFIG_MOCKS.hunts.huntRun.mockedUrl.replace('{name}', name),
            () => {
              return HttpResponse.json(mockedResponse);
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
          return http.post(
            API_CONFIG_MOCKS.hunts.huntRun.mockedUrl.replace('{name}', name),
            () => {
              return HttpResponse.json(mockedResponse, { status });
            },
          );
        },
      },
    },
  },
  oidc: {
    login: {
      mockedUrl: '/api/v1/auth/oidc/{provider}/login',
      post: {
        success: () => {
          console.error('Not implemented');
        },
      },
    },
    callback: {
      mockedUrl: '/api/v1/auth/oidc/{provider}/callback',
      get: {
        success: () => {
          console.error('Not implemented');
        },
      },
    },
  },
  oidc_providers: {
    default: {
      mockedUrl: '/api/v1/auth/oidc-providers',
      post: {
        success: ({
          mockedResponse = {
            name: 'string',
            display_name: 'string',
            enabled: true,
            type: 'generic',
            issuer: 'string',
            client_id_env: 'string',
            created_at: 'string',
            last_sync_at: 'string',
            last_sync_status: 'string',
            sync_error: 'string',
            groups: {
              mode: 'manual',
              claim_name: 'string',
              sync_interval: 1000,
              service_account_json_env: 'string',
              admin_email: 'string',
              domain: 'string',
              tenant_id_env: 'string',
              client_secret_env: 'string',
              api_token_env: 'string',
              okta_domain: 'string',
            },
          },
        }: {
          mockedResponse?: TCreateOidcProviderResponse;
        } = {}) => {
          return http.post(
            API_CONFIG_MOCKS.oidc_providers.default.mockedUrl,
            () => {
              return HttpResponse.json(mockedResponse);
            },
          );
        },
        error: ({
          mockedResponse = DEFAULT_VALIDATION_ERROR,
          status = 422,
        }: {
          mockedResponse?: TValidationError;
          status?: number;
        } = {}) => {
          return http.post(
            API_CONFIG_MOCKS.oidc_providers.default.mockedUrl,
            () => {
              return HttpResponse.json(mockedResponse, { status });
            },
          );
        },
      },
    },
    provider: {
      mockedUrl: '/api/v1/auth/oidc-providers/{name}',
      get: {
        success: () => {
          console.error('Not implemented');
        },
      },
    },
    sync: {
      mockedUrl: '/api/v1/auth/oidc-providers/{name}/sync',
      post: {
        success: () => {
          console.error('Not implemented');
        },
      },
    },
    test: {
      mockedUrl: '/api/v1/auth/oidc-providers/{name}/test',
      post: {
        success: () => {
          console.error('Not implemented');
        },
      },
    },
  },
});
