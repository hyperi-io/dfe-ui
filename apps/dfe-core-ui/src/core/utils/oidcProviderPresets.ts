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

/** The preset fields a Type change applies: a field still empty or holding any type's preset takes the new type's preset, so a value the user typed is kept. The group mode takes the new type's default unless the user chose one the new type also accepts. */
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
    fields.groups = {
      ...preset.groups,
      ...current.groups,
      mode: preset.groups.mode,
    };
  }
  return fields;
};
