import {
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

/** The preset fields a Type change applies: a field still empty or holding any type's preset takes the new type's preset, so a value the user typed is kept; the groups block is left alone because every type shares one default. */
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

  return Object.fromEntries(applied.map((key) => [key, preset[key]]));
};
