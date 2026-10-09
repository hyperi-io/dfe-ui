import {
  GROUP_MODE_OPTIONS,
  GROUP_MODES_BY_TYPE,
  PROVIDERS,
  PROVIDERS_MAP,
} from '@/core/constants/oidcProviders.constants';
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
  mode: string | undefined;
  type: string;
}) =>
  mode !== undefined &&
  groupModeOptionsForType({ type }).some((option) => option.value === mode) &&
  !PROVIDERS.some((provider) => provider.initialValues.groups?.mode === mode);

/** The Enrich on Login value the engine fixes for a type and mode, or undefined when the user chooses (Okta in API mode) or the type or mode is not known yet. Google always enriches because its tokens carry no groups. */
export const forcedEnrichOnLogin = ({
  mode,
  type,
}: {
  mode?: string;
  type?: string;
}) => {
  if (type === undefined || mode === undefined) {
    return undefined;
  }
  if (type === 'google') {
    return true;
  }
  return type === 'okta' && mode === 'api' ? undefined : false;
};

/** The group mode options the engine accepts for a provider type, or every option for an unknown type. */
export const groupModeOptionsForType = ({ type }: { type?: string }) => {
  const modes = type ? GROUP_MODES_BY_TYPE[type] : undefined;

  return modes
    ? GROUP_MODE_OPTIONS.filter((option) => modes.includes(option.value))
    : GROUP_MODE_OPTIONS;
};

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
