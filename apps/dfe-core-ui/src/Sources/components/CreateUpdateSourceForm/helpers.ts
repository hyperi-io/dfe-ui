import { FormProps } from 'antd';
import {
  CreateUpdateSourceFormData,
  TAB_FORM_VALIDATION_KEY_MAP,
} from './sourceForm.schema';

type OnFinishFailedArg = Parameters<
  NonNullable<FormProps<CreateUpdateSourceFormData>['onFinishFailed']>
>[0];

/** Entries from `onFinishFailed` or `onFieldsChange` (`allFields`) — `errors` is optional on `FieldData`. */
type ErrorFieldListItem = {
  name: NonNullable<OnFinishFailedArg['errorFields']>[number]['name'];
  errors?: string[];
};

export type FormValidationErrors = {
  [K in keyof typeof TAB_FORM_VALIDATION_KEY_MAP]: string[];
};

// Origin has no tab of its own: those fields render inside Configuration, so
// their errors report there.
const TAB_ERROR_KEYS = {
  sourceDetails: ['sourceDetails', 'origin'],
  schemaConfig: ['schemaConfig'],
  transform: ['transform'],
  views: ['views'],
} as const;

export type SourceFormTab = keyof typeof TAB_ERROR_KEYS;

export const TAB_LABEL_MAP: Record<SourceFormTab, string> = {
  sourceDetails: 'Configuration',
  schemaConfig: 'Meta Schema',
  transform: 'Transform',
  views: 'Views',
};

export const getTabErrors = (
  validationErrors: FormValidationErrors,
  tab: SourceFormTab,
): string[] => TAB_ERROR_KEYS[tab].flatMap((key) => validationErrors[key]);

/** Labels of the tabs that are on screen AND hold at least one error. */
export const getTabsWithErrors = (
  validationErrors: FormValidationErrors,
  visibleTabs: readonly SourceFormTab[],
): string[] =>
  visibleTabs
    .filter((tab) => getTabErrors(validationErrors, tab).length > 0)
    .map((tab) => TAB_LABEL_MAP[tab]);

export const getValidationErrors = ({
  formFields,
}: {
  formFields: ErrorFieldListItem[];
}): FormValidationErrors => {
  const fields = formFields ?? [];
  return (
    Object.keys(TAB_FORM_VALIDATION_KEY_MAP) as Array<
      keyof typeof TAB_FORM_VALIDATION_KEY_MAP
    >
  ).reduce((acc, key) => {
    acc[key] = fields
      .filter((field) => {
        return TAB_FORM_VALIDATION_KEY_MAP[key].includes(
          field.name[0] as string,
        );
      })
      .flatMap((field) => field.errors ?? [])
      .filter((msg): msg is string => msg != null);
    return acc;
  }, {} as FormValidationErrors);
};
