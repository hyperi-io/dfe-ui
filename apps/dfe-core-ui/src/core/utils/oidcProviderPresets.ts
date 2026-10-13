import {
  PROVIDERS,
  PROVIDERS_MAP,
} from '@/core/constants/oidcProviders.constants';
import {
  isGroupModeAllowed,
  isOidcProviderType,
  type TGroupMode,
} from '@/core/helpers/oidcProviderFieldRules';
import { CreateUpdateOidcProviderFormData } from '@/core/validationSchemas/oidcProviders.schema';

type TPresetValues = Partial<CreateUpdateOidcProviderFormData>;
type TPresetKey = keyof TPresetValues;

const isPresetOrEmpty = (key: TPresetKey, value: unknown) =>
  value === undefined ||
  value === '' ||
  PROVIDERS.some((provider) => provider.initialValues[key] === value);

const keepsGroupMode = ({
  mode,
  type,
}: {
  mode: TGroupMode | undefined;
  type: string;
}) =>
  mode !== undefined &&
  isOidcProviderType(type) &&
  isGroupModeAllowed(type, mode) &&
  !PROVIDERS.some((provider) => provider.initialValues.groups?.mode === mode);

/** The preset fields a Type change applies: a field still empty or holding any type's preset takes the new type's preset, so a value the user typed is kept. The groups block is left alone when its mode is one no type starts in (Manual) and the new type accepts it; otherwise it takes the new type's mode and Enrich on Login and keeps the other group fields already set. */
export const presetFieldsForType = ({
  current,
  type,
}: {
  current: TPresetValues;
  type: string;
}): TPresetValues => {
  const preset = PROVIDERS_MAP[type]?.initialValues ?? {};
  const keys = Object.keys(preset) as TPresetKey[];
  const applied = keys.filter(
    (key) => key !== 'groups' && isPresetOrEmpty(key, current[key]),
  );
  const fields: TPresetValues = Object.fromEntries(
    applied.map((key) => [key, preset[key]]),
  );

  if (preset.groups && !keepsGroupMode({ mode: current.groups?.mode, type })) {
    // The preset's Enrich on Login is the new type's forced value, so the old type's never carries over.
    fields.groups = {
      ...preset.groups,
      ...current.groups,
      enrich_on_login: preset.groups.enrich_on_login,
      mode: preset.groups.mode,
    };
  }
  return fields;
};
