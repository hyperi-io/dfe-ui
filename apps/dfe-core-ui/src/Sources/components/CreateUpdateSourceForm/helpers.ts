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
