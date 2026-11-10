/* eslint-disable no-restricted-imports */
import { TLibraryArtifactFilters } from '@/core/hooks/library/useFetchLibraryArtifacts/types';
import { UseFetchInfiniteFilteredFieldMapsProps } from '@/core/hooks/useFetchInfiniteFilteredFieldMaps/types';
import { useFetchInfiniteFilteredGroupsProps } from '@/core/hooks/useFetchInfiniteFilteredGroups/types';
import { UseFetchInfiniteFilteredHuntsProps } from '@/core/hooks/useFetchInfiniteFilteredHunts/types';
import { UseFetchInfiniteFilteredOrganisationsProps } from '@/core/hooks/useFetchInfiniteFilteredOrganisations/types';
import { UseFetchInfiniteFilteredRulesProps } from '@/core/hooks/useFetchInfiniteFilteredRules/types';
import { UseFetchInfiniteFilteredSchemasProps } from '@/core/hooks/useFetchInfiniteFilteredSchemas/types';
import { UseFetchInfiniteFilteredSourceCatalogueTagsProps } from '@/core/hooks/useFetchInfiniteFilteredSourceCatalogueTags/types';
import { UseFetchInfiniteFilteredSourcesProps } from '@/core/hooks/useFetchInfiniteFilteredSources/types';
import { UseFetchInfiniteSourceCataloguesProps } from '@/core/hooks/useFetchInfiniteSourceCatalogues/types';
import { UseFetchInfiniteFilteredAlertsProps } from '@/Hunts/hooks/useFetchInfiniteFilteredAlerts/types';
import { UseFetchGitOpsLogProps } from '@/Platform/hooks/gitops/useFetchGitOpsLog/types';
import { UseFetchInfiniteDefaultsDriftSourcesProps } from '@/Platform/hooks/system/useFetchInifniteDefaultDriftSources/types';
import { TFetchAccountsQueryParams } from '@/Settings/hooks/accounts/useFetchInfiniteFilteredAccounts/types';
import { useFetchInfiniteFilteredApiKeysProps } from '@/Settings/hooks/apiKeys/useFetchInfiniteFilteredApiKeys/types';
import { UseFetchInfiniteFilteredOidcProvidersProps } from '@/Settings/hooks/oidcProviders/useFetchInfiniteFilteredOidcProviders/types';
import { UseFetchInfiniteFilteredRolesProps } from '@/Settings/hooks/roles/useFetchInfiniteFilteredRoles/types';
import { UseFetchInfiniteFilteredRoleScopesProps } from '@/Settings/hooks/roles/useFetchInfiniteFilteredRoleScopes/types';
import { UseFetchInfiniteSourceColumnsProps } from '@/Sources/hooks/useFetchInfiniteSourceColumns/types';

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
      status,
      sort_by,
      sort_order,
      page_size,
    }: UseFetchInfiniteFilteredSourcesProps = {}) => {
      return [
        'sources',
        ...(search ? ['search', search] : []),
        ...(status ? ['status', status] : []),
        ...(sort_by ? ['sort_by', sort_by] : []),
        ...(sort_order ? ['sort_order', sort_order] : []),
        ...(page_size ? ['page_size', page_size] : []),
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
    sourceLag: ({ name }: { name?: string | null } = {}) => [
      'sources',
      '{name}',
      'lag',
      ...(name ? [name] : []),
    ],
    sourceColumns: ({
      source_name,
      version,
      page_size,
    }: UseFetchInfiniteSourceColumnsProps = {}) => [
      'sources',
      '{name}',
      'columns',
      ...(source_name ? [source_name] : []),
      ...(version ? [version] : []),
      ...(page_size ? [page_size] : []),
    ],
    sourceBuild: () => ['sources', '{name}', 'build'],
    sourceVersion: () => ['sources', '{name}', 'versions', '{version}'],
    bulk: () => ['sources', 'bulk'],
    seed: () => ['sources', 'seed'],
    plan: () => ['sources', '{name}', 'plan'],
    deploy: () => ['sources', '{name}', 'deploy'],
    catalogue: ({
      search,
      intake,
      tags,
      engine,
      include_stored,
      page_size,
      page,
    }: UseFetchInfiniteSourceCataloguesProps = {}) => [
      'sources',
      'catalogue',
      ...(search ? ['search', search] : []),
      ...(intake ? ['intake', intake] : []),
      ...(tags ? ['tags', tags.join(',')] : []),
      ...(engine ? ['engine', engine] : []),
      ...(include_stored ? ['include_stored'] : []),
      ...(page_size ? ['page_size', page_size] : []),
      ...(page ? ['page', page] : []),
    ],
    fromCatalogue: () => ['sources', 'from-catalogue'],
    engines: () => ['sources', 'engines'],
    catalogueTags: ({
      name,
      page_size,
    }: UseFetchInfiniteFilteredSourceCatalogueTagsProps = {}) => [
      'sources',
      'catalogue-tags',
      ...(name ? [name] : []),
      ...(page_size ? ['page_size', page_size] : []),
    ],
  },
  ingest: {
    rules: () => ['ingest', 'rules'],
    rulesOrder: () => ['ingest', 'rules', 'order'],
    compat: () => ['ingest', 'compat'],
    compatProfiles: () => ['ingest', 'compat-profiles'],
  },
  usage: {
    overview: () => ['usage', 'overview'],
  },
  deployment: {
    adminLinks: () => ['deployment', 'admin-links'],
  },
  fieldMaps: {
    default: ({
      search,
      standard,
      sort_by,
      sort_order,
      page_size,
    }: UseFetchInfiniteFilteredFieldMapsProps = {}) => [
      'field-maps',
      ...(search ? ['search', search] : []),
      ...(standard ? ['standard', standard] : []),
      ...(sort_by ? ['sort_by', sort_by] : []),
      ...(sort_order ? ['sort_order', sort_order] : []),
      ...(page_size ? ['page_size', page_size] : []),
    ],
    standard: ({ standard }: { standard?: string | null } = {}) => [
      'field-maps',
      '{standard}',
      ...(standard ? [standard] : []),
    ],
    source: ({
      standard,
      source,
    }: { standard?: string | null; source?: string | null } = {}) => [
      'field-maps',
      '{standard}',
      '{source}',
      ...(standard ? [standard] : []),
      ...(source ? [source] : []),
    ],
    seed: () => ['field-maps', 'seed'],
  },
  rules: {
    default: ({
      search,
      severity,
      source,
      sort_by,
      sort_order,
      page_size,
    }: UseFetchInfiniteFilteredRulesProps = {}) => [
      'rules',
      ...(search ? ['search', search] : []),
      ...(severity ? ['severity', severity] : []),
      ...(source ? ['source', source] : []),
      ...(sort_by ? ['sort_by', sort_by] : []),
      ...(sort_order ? ['sort_order', sort_order] : []),
      ...(page_size ? ['page_size', page_size] : []),
    ],
    validate: () => ['rules', 'validate'],
    rule: ({ name }: { name?: string | null } = {}) => [
      'rules',
      '{name}',
      ...(name ? [name] : []),
    ],
  },
  alerts: {
    destinations: ({
      search,
      hunt,
      sort_by,
      sort_order,
      page_size,
    }: UseFetchInfiniteFilteredAlertsProps = {}) => [
      'alerts',
      'destinations',
      ...(search ? ['search', search] : []),
      ...(hunt ? ['hunt', hunt] : []),
      ...(sort_by ? ['sort_by', sort_by] : []),
      ...(sort_order ? ['sort_order', sort_order] : []),
      ...(page_size ? ['page_size', page_size] : []),
    ],
    destination: ({ name }: { name?: string | null } = {}) => [
      'alerts',
      'destinations',
      '{name}',
      ...(name ? [name] : []),
    ],
  },
  transforms: {
    compile: () => ['transforms', 'compile'],
    test: () => ['transforms', 'test'],
  },
  schemas: {
    default: ({
      search,
      schema_type,
      sort_by,
      sort_order,
      page_size,
    }: UseFetchInfiniteFilteredSchemasProps = {}) => [
      'schemas',
      ...(search ? ['search', search] : []),
      ...(schema_type?.length ? ['schema_type', schema_type.join(',')] : []),
      ...(sort_by ? ['sort_by', sort_by] : []),
      ...(sort_order ? ['sort_order', sort_order] : []),
      ...(page_size ? ['page_size', page_size] : []),
    ],
    schemaVersions: () => [
      'schemas',
      'definitions',
      '{schema_path}',
      'versions',
    ],
    schemaVersionsVersion: ({
      schema_path,
      version,
    }: { schema_path?: string | null; version?: string | null } = {}) => [
      'schemas',
      'definitions',
      '{schema_path}',
      'versions',
      '{version}',
      ...(schema_path ? [schema_path] : []),
      ...(version ? [version] : []),
    ],
    schema: () => ['schemas', 'definitions', '{schema_path}'],
    schemaDetail: ({
      schema_path,
      version,
      search,
      name,
      type,
      use_case,
      expr,
      comment,
      attribute,
      selectedSearchableColumns,
      page_size,
    }: {
      schema_path?: string | null;
      version?: string | null;
      search?: string | null;
      name?: string | null;
      type?: string | null;
      use_case?: string | null;
      expr?: string | null;
      comment?: string | null;
      attribute?: string | null;
      selectedSearchableColumns?: string[] | null;
      page_size?: number | null;
    } = {}) => [
      'schemas',
      'definitions',
      '{schema_path}',
      'versions',
      'columns',
      ...(schema_path ? [schema_path] : []),
      ...(version ? [version] : []),
      ...(search ? ['search', search] : []),
      ...(name ? ['name', name] : []),
      ...(type ? ['type', type] : []),
      ...(use_case ? ['use_case', use_case] : []),
      ...(expr ? ['expr', expr] : []),
      ...(comment ? ['comment', comment] : []),
      ...(attribute ? ['attribute', attribute] : []),
      ...(selectedSearchableColumns
        ? ['selectedSearchableColumns', selectedSearchableColumns.join(',')]
        : []),
      ...(page_size ? ['page_size', page_size] : []),
    ],
    elasticConvert: () => ['schemas', 'elastic-converter'],
    sampleRows: ({
      source_name,
      version,
    }: { source_name?: string; version?: string } = {}) => [
      'schemas',
      '{source_name}',
      'sample-rows',
      ...(source_name ? [source_name] : []),
      ...(version ? [version] : []),
    ],
    jsonPaths: ({
      source_name,
      samples,
      stats,
      paths,
      version,
    }: {
      source_name?: string;
      samples?: number;
      stats?: boolean;
      paths?: string;
      version?: string;
    } = {}) => [
      'schemas',
      '{source_name}',
      'json-paths',
      ...(source_name ? [source_name] : []),
      ...(samples ? ['samples', samples] : []),
      ...(stats ? ['stats', stats] : []),
      ...(paths ? ['paths', paths] : []),
      ...(version ? ['version', version] : []),
    ],
    promoteField: () => ['schemas', '{source_name}', 'promote-field'],
  },
  orgs: {
    default: ({
      search,
      sort_by,
      sort_order,
      page_size,
    }: UseFetchInfiniteFilteredOrganisationsProps = {}) => [
      'orgs',
      ...(search ? ['search', search] : []),
      ...(sort_by ? ['sort_by', sort_by] : []),
      ...(sort_order ? ['sort_order', sort_order] : []),
      ...(page_size ? ['page_size', page_size] : []),
    ],
    org: ({ name }: { name?: string | null } = {}) => [
      'orgs',
      '{name}',
      ...(name ? [name] : []),
    ],
  },
  groups: {
    default: ({
      search,
      sort_by,
      sort_order,
      page_size,
    }: useFetchInfiniteFilteredGroupsProps = {}) => [
      'auth',
      'groups',
      ...(search ? ['search', search] : []),
      ...(sort_by ? ['sort_by', sort_by] : []),
      ...(sort_order ? ['sort_order', sort_order] : []),
      ...(page_size ? ['page_size', page_size] : []),
    ],
    group: ({ name }: { name?: string | null } = {}) => [
      'auth',
      'groups',
      '{name}',
      ...(name ? [name] : []),
    ],
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
      page_size,
    }: TFetchAccountsQueryParams = {}) => [
      'auth',
      'accounts',
      ...(search ? ['search', search] : []),
      ...(oidc_id ? ['oidc_id', oidc_id] : []),
      ...(include_core ? ['include_core', include_core] : []),
      ...(blocked ? ['blocked', blocked] : []),
      ...(sort_by ? ['sort_by', sort_by] : []),
      ...(sort_order ? ['sort_order', sort_order] : []),
      ...(page_size ? ['page_size', page_size] : []),
    ],
    account: ({ username }: { username?: string | null } = {}) => [
      'auth',
      'accounts',
      '{username}',
      ...(username ? [username] : []),
    ],
    resetPassword: () => ['auth', 'accounts', '{username}', 'reset-password'],
    resetCurrentUserPassword: () => ['auth', 'accounts', 'reset-password'],
    me: () => ['auth', 'accounts', 'me'],
  },
  roles: {
    default: ({
      search,
      resource_type,
      page_size,
    }: UseFetchInfiniteFilteredRolesProps = {}) => [
      'auth',
      'roles',
      ...(search ? ['search', search] : []),
      ...(resource_type ? ['resource_type', resource_type] : []),
      ...(page_size ? ['page_size', page_size] : []),
    ],
    role: ({ name }: { name?: string | null } = {}) => [
      'auth',
      'roles',
      '{name}',
      ...(name ? [name] : []),
    ],
    scopes: ({
      search,
      page_size,
    }: UseFetchInfiniteFilteredRoleScopesProps = {}) => [
      'auth',
      'roles',
      'scopes',
      ...(search ? ['search', search] : []),
      ...(page_size ? ['page_size', page_size] : []),
    ],
  },
  hunts: {
    default: ({
      search,
      sort_by,
      sort_order,
      page_size,
    }: UseFetchInfiniteFilteredHuntsProps = {}) => [
      'hunts',
      ...(search ? ['search', search] : []),
      ...(sort_by ? ['sort_by', sort_by] : []),
      ...(sort_order ? ['sort_order', sort_order] : []),
      ...(page_size ? ['page_size', page_size] : []),
    ],
    engineStatus: () => ['hunts', 'status'],
    hunt: ({ name }: { name?: string | null } = {}) => [
      'hunts',
      '{name}',
      ...(name ? [name] : []),
    ],
    huntRun: () => ['hunts', '{name}', 'run'],
  },
  oidc: {
    login: ({
      provider,
      returnTo,
    }: { provider?: string | null; returnTo?: string | null } = {}) => [
      'auth',
      'oidc',
      '{provider}',
      'login',
      ...(provider ? [provider] : []),
      ...(returnTo ? [returnTo] : []),
    ],
    callback: () => ['auth', 'oidc', '{provider}', 'callback'],
  },
  oidcProviders: {
    default: ({
      search,
      sort_by,
      sort_order,
      page_size,
    }: UseFetchInfiniteFilteredOidcProvidersProps = {}) => [
      'auth',
      'oidc-providers',
      ...(search ? ['search', search] : []),
      ...(sort_by ? ['sort_by', sort_by] : []),
      ...(sort_order ? ['sort_order', sort_order] : []),
      ...(page_size ? ['page_size', page_size] : []),
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
    action: ({ name }: { name?: string | null } = {}) => [
      'governance',
      'actions',
      '{name}',
      ...(name ? [name] : []),
    ],
    policies: () => ['governance', 'policies'],
    policy: ({ name }: { name?: string | null } = {}) => [
      'governance',
      'policies',
      '{name}',
      ...(name ? [name] : []),
    ],
    invokeAction: () => ['governance', 'actions', '{name}', 'invoke'],
    adminActions: () => ['governance', 'admin', 'actions'],
    adminAction: () => ['governance', 'admin', 'actions', '{name}'],
    adminPolicies: () => ['governance', 'admin', 'policies'],
    adminPolicy: () => ['governance', 'admin', 'policies', '{name}'],
    reconcileChRbac: () => ['governance', 'ch-rbac', 'reconcile'],
  },
  helm: {
    listFiles: () => ['helm', 'files'],
    fileVariables: ({ name }: { name?: string | null } = {}) => [
      'helm',
      'files',
      '{name}',
      'vars',
      ...(name ? [name] : []),
    ],
    fileVariable: () => ['helm', 'files', '{name}', 'vars', '{path}'],
  },
  apps: {
    default: () => ['apps'],
    instances: () => ['apps', '{service}', 'instances'],
    app: () => ['apps', '{service}', '{instance}'],
    config: ({
      service,
      instance,
    }: { service?: string; instance?: string } = {}) => [
      'apps',
      '{service}',
      '{instance}',
      'config',
      ...(service ? [service] : []),
      ...(instance ? [instance] : []),
    ],
    scaling: ({
      service,
      instance,
    }: { service?: string; instance?: string } = {}) => [
      'apps',
      '{service}',
      '{instance}',
      'scaling',
      ...(service ? [service] : []),
      ...(instance ? [instance] : []),
    ],
    status: ({
      service,
      instance,
      process,
    }: { service?: string; instance?: string; process?: string } = {}) => [
      'apps',
      '{service}',
      '{instance}',
      'status',
      ...(service ? [service] : []),
      ...(instance ? [instance] : []),
      ...(process ? ['process', process] : []),
    ],

    metrics: ({
      service,
      instance,
      process,
    }: { service?: string; instance?: string; process?: string } = {}) => [
      'apps',
      '{service}',
      '{instance}',
      'metrics',
      ...(service ? [service] : []),
      ...(instance ? [instance] : []),
      ...(process ? ['process', process] : []),
    ],
    metricsSeries: ({
      service,
      instance,
      windowSeconds,
      bucketSeconds,
      process,
    }: {
      service?: string;
      instance?: string;
      windowSeconds?: number;
      bucketSeconds?: number;
      process?: string;
    } = {}) => [
      'apps',
      '{service}',
      '{instance}',
      'metrics',
      'series',
      ...(service ? [service] : []),
      ...(instance ? [instance] : []),
      ...(windowSeconds !== undefined ? [String(windowSeconds)] : []),
      ...(bucketSeconds !== undefined ? [String(bucketSeconds)] : []),
      ...(process ? ['process', process] : []),
    ],
    metricsTotals: ({
      service,
      instance,
      windowSeconds,
      process,
    }: {
      service?: string;
      instance?: string;
      windowSeconds?: number;
      process?: string;
    } = {}) => [
      'apps',
      '{service}',
      '{instance}',
      'metrics',
      'totals',
      ...(service ? [service] : []),
      ...(instance ? [instance] : []),
      ...(windowSeconds !== undefined ? [String(windowSeconds)] : []),
      ...(process ? ['process', process] : []),
    ],
    history: ({
      service,
      instance,
      pageSize,
    }: { service?: string; instance?: string; pageSize?: number } = {}) => [
      'apps',
      '{service}',
      '{instance}',
      'history',
      ...(service ? [service] : []),
      ...(instance ? [instance] : []),
      ...(pageSize ? [String(pageSize)] : []),
    ],
    routing: ({
      service,
      instance,
    }: { service?: string; instance?: string } = {}) => [
      'apps',
      '{service}',
      '{instance}',
      'routing',
      ...(service ? [service] : []),
      ...(instance ? [instance] : []),
    ],
    routingSync: ({
      service,
      instance,
    }: { service?: string; instance?: string } = {}) => [
      'apps',
      '{service}',
      '{instance}',
      'routing',
      'sync',
      ...(service ? [service] : []),
      ...(instance ? [instance] : []),
    ],
    files: ({
      service,
      instance,
      setName,
    }: { service?: string; instance?: string; setName?: string } = {}) => [
      'apps',
      '{service}',
      '{instance}',
      'files',
      '{set_name}',
      ...(service ? [service] : []),
      ...(instance ? [instance] : []),
      ...(setName ? [setName] : []),
    ],
    file: ({
      service,
      instance,
      setName,
      filename,
    }: {
      service?: string;
      instance?: string;
      setName?: string;
      filename?: string;
    } = {}) => [
      'apps',
      '{service}',
      '{instance}',
      'files',
      '{set_name}',
      '{filename}',
      ...(service ? [service] : []),
      ...(instance ? [instance] : []),
      ...(setName ? [setName] : []),
      ...(filename ? [filename] : []),
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
    fileLinks: ({
      service,
      instance,
      setName,
    }: { service?: string; instance?: string; setName?: string } = {}) => [
      'apps',
      '{service}',
      '{instance}',
      'files',
      '{set_name}',
      'links',
      ...(service ? [service] : []),
      ...(instance ? [instance] : []),
      ...(setName ? [setName] : []),
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
      ...(kind ? [kind] : []),
      ...(group ? [group] : []),
      ...(state ? [state] : []),
      ...(label?.length ? [label.join(',')] : []),
      ...(q ? [q] : []),
    ],
    kinds: () => ['library', 'kinds'],
    artifact: ({ artifact }: { artifact?: string | null } = {}) => [
      'library',
      '{artifact}',
      ...(artifact ? [artifact] : []),
    ],
    rollback: () => ['library', '{artifact}', 'rollback'],
    state: () => ['library', '{artifact}', 'state'],
    tag: () => ['library', '{artifact}', 'tags', '{tag}'],
    usage: ({ artifact }: { artifact?: string | null } = {}) => [
      'library',
      '{artifact}',
      'usage',
      ...(artifact ? [artifact] : []),
    ],
    versions: ({ artifact }: { artifact?: string | null } = {}) => [
      'library',
      '{artifact}',
      'versions',
      ...(artifact ? [artifact] : []),
    ],
    version: ({
      artifact,
      version,
    }: { artifact?: string | null; version?: number | null } = {}) => [
      'library',
      '{artifact}',
      'versions',
      '{version}',
      ...(artifact ? [artifact] : []),
      ...(version ? [String(version)] : []),
    ],
  },
  gitops: {
    autoMerge: () => ['gitops', 'auto-merge'],
    log: ({
      limit,
      group_by,
      applied_revision,
    }: UseFetchGitOpsLogProps = {}) => [
      'gitops',
      'log',
      ...(limit ? ['limit', limit] : []),
      ...(group_by ? ['group_by', group_by] : []),
      ...(applied_revision ? ['applied_revision', applied_revision] : []),
    ],
  },
  lifecycle: {
    default: () => ['lifecycle'],
    lifecycle: () => ['lifecycle', '{name}'],
  },
  repository: {
    preferences: () => ['repository', 'preferences'],
    objects: ({
      scope,
      scope_id,
      namespace,
    }: {
      scope?: string;
      scope_id?: string;
      namespace?: string;
    } = {}) => [
      'repository',
      'objects',
      '{scope}',
      '{scope_id}',
      '{namespace}',
      ...(scope ? [scope] : []),
      ...(scope_id ? [scope_id] : []),
      ...(namespace ? [namespace] : []),
    ],
    object: ({
      scope,
      scope_id,
      namespace,
      key,
    }: {
      scope?: string;
      scope_id?: string;
      namespace?: string;
      key?: string;
    } = {}) => [
      'repository',
      'objects',
      '{scope}',
      '{scope_id}',
      '{namespace}',
      '{key}',
      ...(scope ? [scope] : []),
      ...(scope_id ? [scope_id] : []),
      ...(namespace ? [namespace] : []),
      ...(key ? [key] : []),
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
      page_size,
    }: UseFetchInfiniteDefaultsDriftSourcesProps = {}) => [
      'system',
      'defaults',
      'drift',
      ...(search ? ['search', search] : []),
      ...(page_size ? ['page_size', page_size] : []),
    ],
    applyDefaults: () => ['system', 'defaults', 'apply'],
    deployment: () => ['system', 'deployment'],
  },
  apiKeys: {
    default: ({
      search,
      sort_by,
      sort_order,
      page_size,
    }: useFetchInfiniteFilteredApiKeysProps = {}) => [
      'auth',
      'api-keys',
      ...(search ? ['search', search] : []),
      ...(sort_by ? ['sort_by', sort_by] : []),
      ...(sort_order ? ['sort_order', sort_order] : []),
      ...(page_size ? ['page_size', page_size] : []),
    ],
    apiKey: () => ['auth', 'api-keys', '{short_token}'],
  },
} as const satisfies Record<
  string,
  Record<string, () => (string | number | true)[]>
>);
/* eslint-enable no-restricted-imports */
