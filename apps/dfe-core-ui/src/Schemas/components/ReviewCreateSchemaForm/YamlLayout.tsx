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
  const { path, ...restValues } = values;
  const yamlContent = useMemo(
    () =>
      yaml.stringify(restValues, {
        indent: 2,
        lineWidth: 0,
      }),
    [restValues],
  );

  const handleFinish = () => {
    onFinish?.();
  };
  return (
    <div className="flex flex-col gap-2">
      <p className="text-foreground-muted dark:text-dark-foreground-muted">
        File pathname: {path}.yaml
      </p>
      <AceEditor value={yamlContent} mode="yaml" readOnly />
      <Button type="primary" className="ml-auto" onClick={handleFinish}>
        {buttonLabel}
      </Button>
    </div>
  );
};
