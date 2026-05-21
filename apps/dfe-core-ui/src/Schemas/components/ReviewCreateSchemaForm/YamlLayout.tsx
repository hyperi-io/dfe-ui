import { AceEditor } from '@/core/components/AceEditor';
import { SchemaCreateRequest } from '@/Schemas/hooks/useCreateSchema/types';
import { Button } from 'antd';
import { useMemo } from 'react';
import yaml from 'yaml';

interface YamlLayoutProps {
  values: SchemaCreateRequest;
  buttonLabel: string;
  onFinish?: () => void;
}

export const YamlLayout = ({
  values,
  buttonLabel,
  onFinish,
}: YamlLayoutProps) => {
  const yamlContent = useMemo(
    () =>
      yaml.stringify(values, {
        indent: 2,
        lineWidth: 0,
      }),
    [values],
  );

  const handleFinish = () => {
    onFinish?.();
  };
  return (
    <div className="flex flex-col gap-2">
      <AceEditor value={yamlContent} mode="yaml" readOnly />
      <Button type="primary" className="ml-auto" onClick={handleFinish}>
        {buttonLabel}
      </Button>
    </div>
  );
};
