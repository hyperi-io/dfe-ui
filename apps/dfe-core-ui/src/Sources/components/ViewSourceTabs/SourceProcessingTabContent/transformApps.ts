import { TAppCatalogueEntry } from '@/core/hooks/apps/instances/useFetchApps/types';

/** One transform app as a selector offers it for a single source. */
export type TransformOption = {
  /** The catalogued app that runs it. */
  service: string;
  /** What the source's transform.engine holds to select it. */
  engine: string;
  /** The source names this engine. */
  selected: boolean;
  /** An instance named for this source exists for this app. */
  running: boolean;
  /** The other sources this app already runs for. */
  boundElsewhere: string[];
  /** Why the engine cannot take this option, or null when it can. */
  unavailable: string | null;
  app: TAppCatalogueEntry;
};

/**
 * The transform apps in the catalogue.
 *
 * `transform_engine` is the engine name a source writes to select the app, and
 * the engine derives it from the same catalogue rule its write path validates
 * against. Reading it here is what stops a picker and the validator disagreeing,
 * so no app name is matched by hand.
 */
export const isTransformApp = (app: TAppCatalogueEntry): boolean =>
  typeof app.transform_engine === 'string' && app.transform_engine.length > 0;

/**
 * Every transform the operator may choose for this source, in engine order.
 *
 * An app the deployment does not offer is listed and refused rather than
 * hidden: an operator who cannot see it goes looking for it.
 */
export const buildTransformOptions = ({
  apps,
  source,
  engine,
}: {
  apps: TAppCatalogueEntry[];
  source: string;
  engine: string | null;
}): TransformOption[] =>
  apps
    .filter(isTransformApp)
    .map((app) => ({
      service: app.service,
      engine: app.transform_engine as string,
      selected: app.transform_engine === engine,
      running: app.instances.includes(source),
      boundElsewhere: app.instances.filter((instance) => instance !== source),
      unavailable:
        app.offered === false
          ? 'This deployment does not offer it in its profile.'
          : null,
      app,
    }))
    .sort((a, b) => a.engine.localeCompare(b.engine));
