import { ADVANCED_OPTIONS } from '@/core/components/CreateSchemaForm/AddSchemaTable/fieldOptions.constants';
import { Form, FormInstance, Select, SelectProps } from 'antd';
import { useMemo } from 'react';

interface LazyMountedSelectProps extends SelectProps {
  typeDetails: {
    name: string | (string | number)[];
  };
  // Only fetch the form values when the select is mounted
  form: FormInstance;
}
export const LazyMountedSelect = ({
  typeDetails,
  form,
  ...props
}: LazyMountedSelectProps) => {
  // Only fetch the form values when the select is mounted
  const baseTypeValue = Form.useWatch(typeDetails.name, form);

  const options = useMemo(() => {
    if (!baseTypeValue) return [];
    return ADVANCED_OPTIONS.filter(
      (option) => option.primitive === baseTypeValue,
    );
  }, [baseTypeValue]);

  return (
    <Select placeholder="Select override type" options={options} {...props} />
  );
};
