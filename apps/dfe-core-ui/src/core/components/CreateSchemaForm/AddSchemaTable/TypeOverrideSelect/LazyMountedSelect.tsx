import {
  overrideSelectOptions,
  TransformFunctionParams,
} from '@/core/components/CreateSchemaForm/AddSchemaTable/fieldOptions.constants';
import { Form } from '@/core/components/Form';
import { FormNotification } from '@/core/components/FormNotification';
import { useFetchSchemaVocabulary } from '@/core/hooks/useFetchSchemaVocabulary';
import {
  Button,
  FormInstance,
  Input,
  InputNumber,
  Select,
  SelectProps,
} from 'antd';
import { useMemo, useState } from 'react';
import {
  getInitialAdvancedOptions,
  getInitialOverrideType,
  transformOverride,
  validateOverride,
} from './TypeOverrideSelect.helpers';

interface LazyMountedSelectProps extends SelectProps {
  typeDetails: {
    type_form_name: string | (string | number)[];
    ch_override_form_name: string | (string | number)[];
  };
  // Only fetch the form values when the select is mounted
  form: FormInstance;
}

const NO_OVERRIDES: never[] = [];

export const LazyMountedSelect = ({
  typeDetails,
  form,
  onChange,
  ...props
}: LazyMountedSelectProps) => {
  const { data: vocabulary } = useFetchSchemaVocabulary();
  const overrides = vocabulary?.ch_overrides ?? NO_OVERRIDES;
  const [overrideType, setOverrideType] = useState<string | null>(
    getInitialOverrideType(props.value, overrides),
  );
  const [validationError, setValidationError] = useState<string | null>(null);
  const [advancedOptions, setAdvancedOptions] =
    useState<TransformFunctionParams>(
      getInitialAdvancedOptions(props.value, overrides),
    );
  // Only fetch the form values when the select is mounted
  const baseTypeValue = Form.useWatch(typeDetails.type_form_name, form);

  const options = useMemo(() => {
    if (!baseTypeValue) return [];
    return overrideSelectOptions(overrides, baseTypeValue);
  }, [baseTypeValue, overrides]);

  const parameters =
    overrides.find((option) => option.value === overrideType)?.parameters ?? [];
  const numberParameters = parameters.filter(({ kind }) => kind === 'integer');
  const textParameters = parameters.filter(({ kind }) => kind === 'text');

  const setParameter = (name: string, value: number | string | undefined) => {
    setValidationError(null);
    setAdvancedOptions({ ...advancedOptions, [name]: value });
  };

  const handleApplyOverride = () => {
    const error = validateOverride(overrideType, advancedOptions, overrides);
    if (error) {
      setValidationError(error);
      return;
    }
    onChange?.(transformOverride(overrideType, advancedOptions, overrides));
  };

  return (
    <div className="flex flex-col gap-2">
      <Select
        placeholder="Select override type"
        options={options}
        onChange={(value: string | null) => {
          setOverrideType(value);
          setValidationError(null);
        }}
        allowClear
        {...props}
        value={overrideType}
      />

      {numberParameters.length > 0 && (
        <div className="flex gap-2">
          {numberParameters.map(({ name, label }) => (
            <span key={name} className="flex flex-col gap-1 w-full">
              <label>{label}</label>
              <InputNumber
                className="w-full"
                value={advancedOptions[name] as number | undefined}
                onChange={(value: number | null) =>
                  setParameter(name, value || undefined)
                }
                placeholder={`Input ${label}`}
              />
            </span>
          ))}
        </div>
      )}
      {textParameters.map(({ name, label }) => (
        <span key={name} className="flex flex-col gap-1 w-full">
          <label>{label}</label>
          <Input
            className="w-full"
            placeholder={`Input ${label.split(' (')[0]}`}
            value={advancedOptions[name] as string | undefined}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setParameter(name, e.target.value)
            }
          />
        </span>
      ))}
      {validationError && (
        <FormNotification type="error" text={validationError} />
      )}
      <Button size="small" type="primary" onClick={handleApplyOverride}>
        Apply Override
      </Button>
    </div>
  );
};
