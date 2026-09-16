import { Form } from '@/core/components/Form';
import { NotificationCard } from '@/core/components/NotificationCard';
import { useFetchSystemDefaults } from '@/core/hooks/useFetchSystemDefaults';
import { cn } from '@/core/utils/style';
import { CreateUpdateSourceFormData } from '@/Sources/components/CreateUpdateSourceForm';
import { CommonHeaderSelect } from '@/Sources/components/CreateUpdateSourceForm/SchemaConfigTabContent/CommonHeaderSelect';
import {
  engineArgumentsError,
  TableEngineInput,
} from '@/Sources/components/CreateUpdateSourceForm/SchemaConfigTabContent/TableEngineInput';
import {
  dfeDefaultText,
  OverrideTag,
  ttlDaysText,
} from '@/Sources/components/DefaultOverride';
import { useFetchTableEngines } from '@/Sources/hooks/useFetchTableEngines';
import { Button, FormInstance, InputNumber, Select } from 'antd';
import { Rule } from 'antd/es/form';
import { useCallback, useMemo, useState } from 'react';
import { isDefaultOveridden } from './defaultSection.helpers';

export const DefaultsSection = ({
  formValidation,
  form,
  className,
}: {
  formValidation: Rule;
  form: FormInstance<CreateUpdateSourceFormData>;
  className?: string;
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const { data: defaults, isLoading, error } = useFetchSystemDefaults();
  const { engines, isLoading: isLoadingEngines } = useFetchTableEngines();

  const [commonHeaderVersions, setCommonHeaderVersions] = useState<string[]>(
    [],
  );
  const handleChangeCommonHeader = useCallback(
    (
      value: string | null,
      commonHeader?: { versions: string[] },
      action_type?: string,
    ) => {
      if (value) {
        setCommonHeaderVersions(commonHeader?.versions ?? []);

        if (action_type === '_select') {
          form.setFieldsValue({
            header: {
              version:
                commonHeader?.versions?.length === 1
                  ? commonHeader?.versions?.[0]
                  : undefined,
            },
          });
        }
      }
    },
    [form],
  );
  const commonHeaderVersionsOptions = useMemo(() => {
    return (
      commonHeaderVersions?.map((version) => ({
        label: version,
        value: version,
      })) ?? []
    );
  }, [commonHeaderVersions]);

  // Default overrides
  const headerTypeInitialValue = Form.useWatch(['header', 'type'], form);
  const headerVersionInitialValue = Form.useWatch(['header', 'version'], form);
  const ttlDaysInitialValue = Form.useWatch(['schema', 'ttl_days'], form);
  const engineInitialValue = Form.useWatch(['schema', 'engine'], form);

  return (
    <div
      className={cn(
        'flex flex-col gap-4 border-t border-foreground/10 dark:border-foreground/20 pt-4',
        className,
      )}
    >
      <div className="flex justify-between">
        <span className="font-semibold text-foreground/60">
          Default Configuration
        </span>
        <Button
          htmlType="button"
          type="default"
          onClick={() => setIsEditing(!isEditing)}
        >
          Override Defaults
        </Button>
      </div>

      {error && (
        <NotificationCard
          type="error"
          title="Error fetching defaults"
          description={error.message}
        />
      )}

      {!isLoading && !error && (
        <div
          className={cn('grid grid-cols-2 gap-4', !isEditing ? 'hidden' : '')}
        >
          <>
            <Form.Item
              className="w-full"
              name={['header', 'type']}
              /**
               * Validate on blur to prevent form submission when clearing the meta schema
               */
              validateTrigger={['onBlur']}
              label={
                <Form.Label required>
                  Header Type{' '}
                  {isDefaultOveridden(
                    headerTypeInitialValue,
                    defaults?.default_header_type,
                  ) && <OverrideTag />}
                </Form.Label>
              }
              rules={[formValidation]}
            >
              <CommonHeaderSelect onChange={handleChangeCommonHeader} />
            </Form.Item>

            <Form.Item
              className="w-full"
              name={['header', 'version']}
              label={
                <Form.Label required>
                  Header Version{' '}
                  {isDefaultOveridden(
                    headerVersionInitialValue,
                    defaults?.default_header_version,
                  ) && <OverrideTag />}
                </Form.Label>
              }
              rules={[formValidation]}
            >
              <Select
                options={commonHeaderVersionsOptions}
                disabled={!commonHeaderVersions?.length}
                placeholder={
                  commonHeaderVersions?.length
                    ? 'Select header version'
                    : 'Select header first to access versions'
                }
              />
            </Form.Item>
            <Form.Item
              className="w-full"
              name={['schema', 'ttl_days']}
              label={
                <span className="flex items-center gap-2">
                  TTL Days
                  {isDefaultOveridden(
                    ttlDaysInitialValue,
                    defaults?.default_ttl_days?.toString(),
                  ) && <OverrideTag />}
                </span>
              }
              rules={[formValidation]}
              extra="Whole days. 0 keeps data forever with no TTL."
            >
              <InputNumber
                className="w-full"
                min={0}
                precision={0}
                placeholder={dfeDefaultText(
                  ttlDaysText(defaults?.default_ttl_days),
                )}
              />
            </Form.Item>
            <Form.Item
              className="w-full"
              name={['schema', 'engine']}
              label={
                <span className="flex items-center gap-2">
                  Engine{' '}
                  {isDefaultOveridden(
                    engineInitialValue,
                    defaults?.default_engine,
                  ) && <OverrideTag />}
                </span>
              }
              rules={[
                formValidation,
                {
                  validator: async (_, value?: string | null) => {
                    const message = engineArgumentsError(value, engines);
                    if (message) {
                      throw new Error(message);
                    }
                  },
                },
              ]}
            >
              <TableEngineInput
                engines={engines}
                loading={isLoadingEngines}
                placeholder={dfeDefaultText(defaults?.default_engine)}
              />
            </Form.Item>
          </>
        </div>
      )}
    </div>
  );
};
