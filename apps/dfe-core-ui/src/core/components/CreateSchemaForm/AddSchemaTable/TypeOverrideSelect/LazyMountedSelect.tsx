import {
  ADVANCED_OPTIONS,
  TransformFunctionParams,
} from '@/core/components/CreateSchemaForm/AddSchemaTable/fieldOptions.constants';
import { FormNotification } from '@/core/components/FormNotification';
import {
  Button,
  Form,
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

export const LazyMountedSelect = ({
  typeDetails,
  form,
  onChange,
  ...props
}: LazyMountedSelectProps) => {
  const [overrideType, setOverrideType] = useState<string | null>(
    getInitialOverrideType(props.value),
  );
  const [validationError, setValidationError] = useState<string | null>(null);
  const [advancedOptions, setAdvancedOptions] =
    useState<TransformFunctionParams>(getInitialAdvancedOptions(props.value));
  // Only fetch the form values when the select is mounted
  const baseTypeValue = Form.useWatch(typeDetails.type_form_name, form);

  const options = useMemo(() => {
    if (!baseTypeValue) return [];
    return ADVANCED_OPTIONS.filter(
      (option) => option.primitive === baseTypeValue,
    );
  }, [baseTypeValue]);

  const handleApplyOverride = () => {
    const error = validateOverride(overrideType, advancedOptions);
    if (error) {
      setValidationError(error);
      return;
    }
    onChange?.(transformOverride(overrideType, advancedOptions));
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

      {(overrideType === 'Decimal' ||
        overrideType === 'Decimal64' ||
        overrideType === 'DateTime64') && (
        <div className="flex gap-2">
          {overrideType !== 'Decimal64' && (
            <span className="flex flex-col gap-1 w-full">
              <label>Precision</label>
              <InputNumber
                className="w-full"
                value={advancedOptions.precision}
                onChange={(value: number | null) => {
                  setValidationError(null);
                  setAdvancedOptions({
                    ...advancedOptions,
                    precision: value || undefined,
                  });
                }}
                placeholder="Input Precision"
              />
            </span>
          )}
          {overrideType !== 'DateTime64' && (
            <span className="flex flex-col gap-1 w-full">
              <label>Scale</label>
              <InputNumber
                className="w-full"
                placeholder="Input Scale"
                value={advancedOptions.scale}
                onChange={(value: number | null) => {
                  setValidationError(null);
                  setAdvancedOptions({
                    ...advancedOptions,
                    scale: value || undefined,
                  });
                }}
              />
            </span>
          )}
        </div>
      )}
      {overrideType === 'FixedString' && (
        <span className="flex flex-col gap-1 w-full">
          <label>Length</label>
          <InputNumber
            className="w-full"
            placeholder="Input Length"
            value={advancedOptions.length}
            onChange={(value: number | null) => {
              setValidationError(null);
              setAdvancedOptions({
                ...advancedOptions,
                length: value || undefined,
              });
            }}
          />
        </span>
      )}
      {overrideType === 'Enum16' && (
        <span className="flex flex-col gap-1 w-full">
          <label>Values (comma separated)</label>
          <Input
            className="w-full"
            placeholder="Input Values"
            value={advancedOptions.values}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              setValidationError(null);
              setAdvancedOptions({
                ...advancedOptions,
                values: e.target.value,
              });
            }}
          />
        </span>
      )}
      {validationError && (
        <FormNotification type="error" text={validationError} />
      )}
      <Button size="small" type="primary" onClick={handleApplyOverride}>
        Apply Override
      </Button>
    </div>
  );
};
