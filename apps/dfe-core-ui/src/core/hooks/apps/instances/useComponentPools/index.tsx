import { TAppCatalogueEntry } from '@/core/hooks/apps/instances/useFetchApps/types';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

const COMPONENT_PARAM = 'component';
const DEFAULT_INSTANCE = 'default';
const INSTANCE_PARAM = 'instance';
const PROCESS_PARAM = 'process';
// Tab labels for service ids the console keeps off the page
const POOL_LABELS: Record<string, string> = { 'dfe-hyperdx': 'discovery' };

export type TComponentPool = {
  defaultInstance: boolean;
  instance: string;
  key: string;
  label: string;
  /** A process deployed from the app's image, read in place of the app. */
  process?: string;
  /** The URL query that opens this pool. */
  query: string;
  scaleDeployed: TAppCatalogueEntry['scale_deployed'];
  service: string;
};

const poolKey = (service: string, instance: string, process?: string) =>
  [service, instance, ...(process ? [process] : [])].join('/');

const poolLabel = (service: string) => POOL_LABELS[service] ?? service;

const byLabel = (a: TAppCatalogueEntry, b: TAppCatalogueEntry) =>
  poolLabel(a.service).localeCompare(poolLabel(b.service));

/** The query naming one component, with the instance only when it is not the default. */
const componentQuery = (
  service: string,
  instance: string,
  process?: string,
) => {
  const params = new URLSearchParams({ [COMPONENT_PARAM]: service });
  if (instance !== DEFAULT_INSTANCE) params.set(INSTANCE_PARAM, instance);
  if (process) params.set(PROCESS_PARAM, process);
  return params.toString();
};

/**
 * The fleet-wide pools, one per instance of a single-multiplicity app, and the
 * one the URL opens.
 *
 * Which apps count is the manifest's `multiplicity`, not a list kept in the UI.
 * Each pool is labelled by its service id, the name it reports telemetry
 * under, or by its name in POOL_LABELS. With `includeProcesses`, each process deployed from an app's image
 * follows that app as a pool of its own. Apps run in alphabetical order of their label, whatever order the catalogue lists them in. A missing or unknown `?component=`
 * opens the first pool.
 */
export const useComponentPools = (
  apps?: TAppCatalogueEntry[],
  { includeProcesses = false }: { includeProcesses?: boolean } = {},
) => {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  const pools: TComponentPool[] = (apps ?? [])
    .filter((app) => app.multiplicity === 'single')
    .sort(byLabel)
    .flatMap((app) =>
      app.instances.flatMap((instance) => [
        {
          defaultInstance: instance === DEFAULT_INSTANCE,
          instance,
          key: poolKey(app.service, instance),
          label: poolLabel(app.service),
          query: componentQuery(app.service, instance),
          scaleDeployed: app.scale_deployed,
          service: app.service,
        },
        ...(includeProcesses ? (app.processes ?? []) : []).map((process) => ({
          defaultInstance: instance === DEFAULT_INSTANCE,
          instance,
          key: poolKey(app.service, instance, process),
          label: process,
          process,
          query: componentQuery(app.service, instance, process),
          scaleDeployed: false,
          service: app.service,
        })),
      ]),
    );

  const requestedKey = poolKey(
    searchParams?.get(COMPONENT_PARAM) ?? '',
    searchParams?.get(INSTANCE_PARAM) ?? DEFAULT_INSTANCE,
    searchParams?.get(PROCESS_PARAM) ?? undefined,
  );
  const activeKey = pools.some((pool) => pool.key === requestedKey)
    ? requestedKey
    : pools[0]?.key;

  const openPool = (key: string) => {
    const pool = pools.find((candidate) => candidate.key === key);
    if (!pool) return;
    const params = new URLSearchParams(searchParams?.toString() ?? '');
    params.delete(INSTANCE_PARAM);
    params.delete(PROCESS_PARAM);
    new URLSearchParams(pool.query).forEach((value, name) =>
      params.set(name, value),
    );
    router.replace(`${pathname}?${params.toString()}`);
  };

  return { activeKey, openPool, pools };
};
