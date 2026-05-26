import { AceEditor } from '@/core/components/AceEditor';
import { FormNotification } from '@/core/components/FormNotification';
import { useCreateSchemaReviewContext } from '@/Schemas/contexts/CreateSchemaReviewContext';
import { SchemaCreateRequest } from '@/Schemas/hooks/useCreateSchema/types';
import { Button } from 'antd';
import { useMemo } from 'react';
import yaml from 'yaml';

interface YamlLayoutProps {
  values: SchemaCreateRequest;
  buttonLabel: string;
  onFinish?: () => void;
  hideFields?: {
    version?: boolean;
  };
}

export const YamlLayout = ({
  values,
  buttonLabel,
  onFinish,
  hideFields,
}: YamlLayoutProps) => {
  const { handleGoBack, formErrorMessage } = useCreateSchemaReviewContext();

  const { path, ...restValues } = values;

  const displayValues = useMemo(() => {
    if (hideFields?.version) {
      return {
        ...restValues,
        versions: {
          _unassigned_: restValues.versions[restValues.current],
        },
      };
    }
    return restValues;
  }, [restValues, hideFields?.version]);

  const yamlContent = useMemo(
    () =>
      yaml.stringify(displayValues, {
        indent: 2,
        lineWidth: 0,
      }),
    [displayValues],
  );

  const handleFinish = () => {
    onFinish?.();
  };
  return (
    <div className="flex flex-col gap-2">
      <p className="text-foreground-muted dark:text-dark-foreground-muted">
        <span className="font-medium text-foreground/40 dark:text-dark-foreground/40">
          File pathname:
        </span>{' '}
        {path}.yaml
      </p>
      <AceEditor value={yamlContent} mode="yaml" readOnly />

      {formErrorMessage && (
        <FormNotification type="error" text={formErrorMessage} />
      )}
      <div className="flex flex-row gap-2 items-center ml-auto">
        <Button type="default" onClick={handleGoBack}>
          Back
        </Button>
        <Button type="primary" className="ml-auto" onClick={handleFinish}>
          {buttonLabel}
        </Button>
      </div>
    </div>
  );
};
