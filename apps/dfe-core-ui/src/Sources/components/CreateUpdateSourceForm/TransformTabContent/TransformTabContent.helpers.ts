import { TAppsResponse } from '@/core/hooks/apps/instances/useFetchApps/types';
import { CreateUpdateSourceFormData } from '@/Sources/components/CreateUpdateSourceForm/sourceForm.schema';

export type AssignTransformOptions = 'none' | 'define_transform';

// The engine names a transform app after the engine it runs, so the two convert
// by this prefix in both directions.
const TRANSFORM_SERVICE_PREFIX = 'dfe-transform-';

export type TransformEngine = {
  /** What the source's transform.engine holds. */
  engine: string;
  /** The catalogued app that runs it. */
  service: string;
};

/**
 * The transform engines the deployed catalogue offers.
 *
 * Read off the catalogue rather than listed here, so an engine the manifest adds
 * or drops reaches the picker without a UI release.
 */
export const getTransformEngines = (apps?: TAppsResponse): TransformEngine[] =>
  (apps ?? [])
    .filter((app) => app.service.startsWith(TRANSFORM_SERVICE_PREFIX))
    .map((app) => ({
      engine: app.service.slice(TRANSFORM_SERVICE_PREFIX.length),
      service: app.service,
    }))
    .sort((a, b) => a.engine.localeCompare(b.engine));

export const getInitialAssignTransform = (
  transform: CreateUpdateSourceFormData['transform'],
): AssignTransformOptions => {
  if (!transform?.engine) {
    return 'none';
  }
  return 'define_transform';
};
