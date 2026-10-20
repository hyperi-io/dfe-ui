/* eslint-disable no-restricted-imports */
import { TLibraryArtifactFilters } from '@/core/hooks/library/useFetchLibraryArtifacts/types';
import { useFetchInfiniteFilteredGroupsProps } from '@/core/hooks/useFetchInfiniteFilteredGroups/types';
import { UseFetchInfiniteFilteredOrganisationsProps } from '@/core/hooks/useFetchInfiniteFilteredOrganisations/types';
import { UseFetchInfiniteFilteredSourcesProps } from '@/core/hooks/useFetchInfiniteFilteredSources/types';
import { UseFetchInfiniteDefaultsDriftSourcesProps } from '@/Platform/hooks/system/useFetchInifniteDefaultDriftSources/types';
import { TFetchAccountsQueryParams } from '@/Settings/hooks/accounts/useFetchInfiniteFilteredAccounts/types';
import { UseFetchInfiniteFilteredOidcProvidersProps } from '@/Settings/hooks/oidcProviders/useFetchInfiniteFilteredOidcProviders/types';
import { UseFetchInfiniteSourceCataloguesProps } from '@/Sources/hooks/useFetchInfiniteSourceCatalogues/types';

export const QUERY_KEYS = Object.freeze({
  auth: {
    login: () => ['auth', 'login'],
    setupStatus: () => ['auth', 'setup-status'],
    refresh: () => ['auth', 'refresh'],
    logout: () => ['auth', 'logout'],
    me: () => ['auth', 'me'],
    permissions: () => ['auth', 'permissions'],
  },
  sources: {
    default: ({
      search,
      status: status,
      sort_by,
      sort_order,
      per_page,
    }: UseFetchInfiniteFilteredSourcesProps = {}) => {
      return [
        'sources',
        ...(search ? [search] : []),
        ...(status ? [status] : []),
        ...(sort_by ? [sort_by] : []),
        ...(sort_order ? [sort_order] : []),
        ...(per_page ? [per_page] : []),
      ];
    },
    source: ({
      name,
      version,
    }: { name?: string | null; version?: string | null } = {}) => {
      return [
        'sources',
        '{name}',
        ...(name ? [name] : []),
        ...(version ? [version] : []),
      ];
    },
    sourceFlow: ({ name }: { name?: string | null } = {}) => [
      'sources',
      '{name}',
      'flow',
      ...(name ? [name] : []),
    ],
    sourceColumns: () => ['sources', '{name}', 'columns'],
    sourceBuild: () => ['sources', '{name}', 'build'],
    sourceVersion: () => ['sources', '{name}', 'versions', '{version}'],
    bulk: () => ['sources', 'bulk'],
    seed: () => ['sources', 'seed'],
    plan: () => ['sources', '{name}', 'plan'],
    deploy: () => ['sources', '{name}', 'deploy'],
    catalogue: ({
      search,
      intake,
      per_page,
    }: UseFetchInfiniteSourceCataloguesProps = {}) => [
      'sources',
      'catalogue',
      ...(search ? ['search', search] : []),
      ...(intake ? ['intake', intake] : []),
      ...(per_page ? ['per_page', per_page] : []),
    ],
    fromCatalogue: () => ['sources', 'from-catalogue', '{entry}'],
    engines: () => ['sources', 'engines'],
  },
  deployment: {
    adminLinks: () => ['deployment', 'admin-links'],
  },
  fieldMaps: {
    default: () => ['field-maps'],
    standard: () => ['field-maps', '{standard}'],
    source: () => ['field-maps', '{standard}', '{source}'],
    seed: () => ['field-maps', 'seed'],
  },
  rules: {
    default: () => ['rules'],
    validate: () => ['rules', 'validate'],
    rule: () => ['rules', '{name}'],
  },
  alerts: {
    destinations: () => ['alerts', 'destinations'],
    destination: () => ['alerts', 'destinations', '{name}'],
  },
  transforms: {
    compile: () => ['transforms', 'compile'],
    test: () => ['transforms', 'test'],
  },
  schemas: {
    default: () => ['schemas'],
    schemaVersions: () => [
      'schemas',
      'definitions',
      '{schema_path}',
      'versions',
    ],
    schemaVersionsVersion: () => [
      'schemas',
      'definitions',
      '{schema_path}',
      'versions',
      '{version}',
    ],
    schema: () => ['schemas', 'definitions', '{schema_path}'],
    schemaDetail: () => [
      'schemas',
      'definitions',
      '{schema_path}',
      'versions',
      'columns',
    ],
    elasticConvert: () => ['schemas', 'elastic-converter'],
    sampleRows: () => ['schemas', '{source_name}', 'sample-rows'],
    jsonPaths: () => ['schemas', '{source_name}', 'json-paths'],
    promoteField: () => ['schemas', '{source_name}', 'promote-field'],
  },
  orgs: {
    default: ({
      search,
      sort_by,
      sort_order,
      page,
      per_page,
    }: UseFetchInfiniteFilteredOrganisationsProps = {}) => [
      'orgs',
      ...(search ? ['search', search] : []),
      ...(sort_by ? ['sort_by', sort_by] : []),
      ...(sort_order ? ['sort_order', sort_order] : []),
      ...(page ? ['page', page] : []),
      ...(per_page ? ['per_page', per_page] : []),
    ],
    org: () => ['orgs', '{name}'],
  },
  groups: {
    default: ({
      search,
      sort_by,
      sort_order,
      page,
      per_page,
    }: useFetchInfiniteFilteredGroupsProps = {}) => [
      'auth',
      'groups',
      ...(search ? ['search', search] : []),
      ...(sort_by ? ['sort_by', sort_by] : []),
      ...(sort_order ? ['sort_order', sort_order] : []),
      ...(page ? ['page', page] : []),
      ...(per_page ? ['per_page', per_page] : []),
    ],
    group: () => ['auth', 'groups', '{name}'],
    groupMembers: () => ['auth', 'groups', '{name}', 'members'],
    groupMember: () => ['auth', 'groups', '{name}', 'members', '{username}'],
  },
  accounts: {
    default: ({
      search,
      oidc_id,
      include_core,
      blocked,
      sort_by,
      sort_order,
      page,
      per_page,
    }: TFetchAccountsQueryParams = {}) => [
      'auth',
      'accounts',
      ...(search ? ['search', search] : []),
      ...(oidc_id ? ['oidc_id', oidc_id] : []),
      ...(include_core ? ['include_core', include_core] : []),
      ...(blocked ? ['blocked', blocked] : []),
      ...(sort_by ? ['sort_by', sort_by] : []),
      ...(sort_order ? ['sort_order', sort_order] : []),
      ...(page ? ['page', page] : []),
      ...(per_page ? ['per_page', per_page] : []),
    ],
    account: () => ['auth', 'accounts', '{username}'],
    resetPassword: () => ['auth', 'accounts', '{username}', 'reset-password'],
    resetCurrentUserPassword: () => ['auth', 'accounts', 'reset-password'],
    me: () => ['auth', 'accounts', 'me'],
  },
  roles: {
    default: () => ['auth', 'roles'],
    role: () => ['auth', 'roles', '{name}'],
    scopes: () => ['auth', 'roles', 'scopes'],
  },
  hunts: {
    default: () => ['hunts'],
    engineStatus: () => ['hunts', 'status'],
    hunt: () => ['hunts', '{name}'],
    huntRun: () => ['hunts', '{name}', 'run'],
  },
  oidc: {
    login: () => ['auth', 'oidc', '{provider}', 'login'],
    callback: () => ['auth', 'oidc', '{provider}', 'callback'],
  },
  oidcProviders: {
    default: ({
      search,
      sort_by,
      sort_order,
      page,
      per_page,
    }: UseFetchInfiniteFilteredOidcProvidersProps = {}) => [
      'auth',
      'oidc-providers',
      ...(search ? ['search', search] : []),
      ...(sort_by ? ['sort_by', sort_by] : []),
      ...(sort_order ? ['sort_order', sort_order] : []),
      ...(page ? ['page', page] : []),
      ...(per_page ? ['per_page', per_page] : []),
    ],
    provider: ({ name }: { name?: string | null } = {}) => [
      'auth',
      'oidc-providers',
      '{name}',
      ...(name ? [name] : []),
    ],
    syncGroups: () => ['auth', 'oidc-providers', '{name}', 'sync'],
    test: ({ name }: { name?: string | null } = {}) => [
      'auth',
      'oidc-providers',
      '{name}',
      'test',
      ...(name ? [name] : []),
    ],
    verifyLogin: ({ name }: { name?: string | null } = {}) => [
      'auth',
      'oidc-providers',
      '{name}',
      'verify-login',
      ...(name ? [name] : []),
    ],
  },
  governance: {
    actions: () => ['governance', 'actions'],
    action: () => ['governance', 'actions', '{name}'],
    policies: () => ['governance', 'policies'],
    policy: () => ['governance', 'policies', '{name}'],
    invokeAction: () => ['governance', 'actions', '{name}', 'invoke'],
    adminActions: () => ['governance', 'admin', 'actions'],
    adminAction: () => ['governance', 'admin', 'actions', '{name}'],
    adminPolicies: () => ['governance', 'admin', 'policies'],
    adminPolicy: () => ['governance', 'admin', 'policies', '{name}'],
    reconcileChRbac: () => ['governance', 'ch-rbac', 'reconcile'],
  },
  helm: {
    listFiles: () => ['helm', 'files'],
    fileVariables: () => ['helm', 'files', '{name}', 'vars'],
    fileVariable: () => ['helm', 'files', '{name}', 'vars', '{path}'],
  },
  apps: {
    default: () => ['apps'],
    instances: () => ['apps', '{service}', 'instances'],
    app: () => ['apps', '{service}', '{instance}'],
    config: () => ['apps', '{service}', '{instance}', 'config'],
    scaling: () => ['apps', '{service}', '{instance}', 'scaling'],
    status: ({
      service,
      instance,
    }: { service?: string | null; instance?: string | null } = {}) => [
      'apps',
      '{service}',
      '{instance}',
      'status',
      ...(service ? [service] : []),
      ...(instance ? [instance] : []),
    ],
    metrics: ({
      service,
      instance,
    }: { service?: string | null; instance?: string | null } = {}) => [
      'apps',
      '{service}',
      '{instance}',
      'metrics',
      ...(service ? [service] : []),
      ...(instance ? [instance] : []),
    ],
    metricsSeries: ({
      service,
      instance,
      windowSeconds,
    }: {
      service?: string | null;
      instance?: string | null;
      windowSeconds?: number;
    } = {}) => [
      'apps',
      '{service}',
      '{instance}',
      'metrics',
      'series',
      ...(service ? [service] : []),
      ...(instance ? [instance] : []),
      ...(windowSeconds ? ['window_seconds', windowSeconds] : []),
    ],
    history: ({
      service,
      instance,
      limit,
    }: {
      service?: string | null;
      instance?: string | null;
      limit?: number;
    } = {}) => [
      'apps',
      '{service}',
      '{instance}',
      'history',
      ...(service ? [service] : []),
      ...(instance ? [instance] : []),
      ...(limit ? ['limit', limit] : []),
    ],
    routing: () => ['apps', '{service}', '{instance}', 'routing'],
    routingSync: () => ['apps', '{service}', '{instance}', 'routing', 'sync'],
    files: () => ['apps', '{service}', '{instance}', 'files', '{set_name}'],
    file: () => [
      'apps',
      '{service}',
      '{instance}',
      'files',
      '{set_name}',
      '{filename}',
    ],
    fileCopy: () => [
      'apps',
      '{service}',
      '{instance}',
      'files',
      '{set_name}',
      'copy',
    ],
    fileDryRun: () => [
      'apps',
      '{service}',
      '{instance}',
      'files',
      '{set_name}',
      'dry-run',
    ],
    fileLink: () => [
      'apps',
      '{service}',
      '{instance}',
      'files',
      '{set_name}',
      'link',
    ],
    fileLinks: () => [
      'apps',
      '{service}',
      '{instance}',
      'files',
      '{set_name}',
      'links',
    ],
    fileRelink: () => [
      'apps',
      '{service}',
      '{instance}',
      'files',
      '{set_name}',
      'relink',
    ],
  },
  backingServices: {
    default: () => ['backing-services'],
    overlayVar: () => [
      'backing-services',
      'overlays',
      '{name}',
      'vars',
      '{path}',
    ],
  },
  library: {
    default: ({
      kind,
      group,
      state,
      label,
      q,
    }: TLibraryArtifactFilters = {}) => [
      'library',
      ...(kind ? ['kind', kind] : []),
      ...(group ? ['group', group] : []),
      ...(state ? ['state', state] : []),
      ...(label?.length ? ['label', label.join(',')] : []),
      ...(q ? ['q', q] : []),
    ],
    kinds: () => ['library', 'kinds'],
    artifact: () => ['library', '{artifact}'],
    rollback: () => ['library', '{artifact}', 'rollback'],
    state: () => ['library', '{artifact}', 'state'],
    tag: () => ['library', '{artifact}', 'tags', '{tag}'],
    usage: () => ['library', '{artifact}', 'usage'],
    versions: () => ['library', '{artifact}', 'versions'],
    version: () => ['library', '{artifact}', 'versions', '{version}'],
  },
  gitops: {
    autoMerge: () => ['gitops', 'auto-merge'],
    log: () => ['gitops', 'log'],
  },
  lifecycle: {
    default: () => ['lifecycle'],
    lifecycle: () => ['lifecycle', '{name}'],
  },
  repository: {
    preferences: () => ['repository', 'preferences'],
    objects: () => [
      'repository',
      'objects',
      '{scope}',
      '{scope_id}',
      '{namespace}',
    ],
    object: () => [
      'repository',
      'objects',
      '{scope}',
      '{scope_id}',
      '{namespace}',
      '{key}',
    ],
  },
  clientConfig: {
    default: () => ['config', 'client'],
  },
  system: {
    version: () => ['system', 'version'],
    settings: () => ['system', 'settings'],
    retention: () => ['system', 'retention'],
    clickhouseCloud: () => ['system', 'clickhouse-cloud'],
    clickhouseCloudStart: () => ['system', 'clickhouse-cloud', 'start'],
    clickhouseCloudStop: () => ['system', 'clickhouse-cloud', 'stop'],
    defaults: () => ['system', 'defaults'],
    defaultsDrift: ({
      search,
      page,
      per_page,
    }: UseFetchInfiniteDefaultsDriftSourcesProps = {}) => [
      'system',
      'defaults',
      'drift',
      ...(search ? ['search', search] : []),
      ...(page ? ['page', page] : []),
      ...(per_page ? ['per_page', per_page] : []),
    ],
    applyDefaults: () => ['system', 'defaults', 'apply'],
  },
  apiKeys: {
    default: () => ['auth', 'api-keys'],
    apiKey: () => ['auth', 'api-keys', '{short_token}'],
  },
} as const satisfies Record<
  string,
  Record<string, () => (string | number | true)[]>
>);
/* eslint-enable no-restricted-imports */
