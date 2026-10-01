import { CommonHeaderSelect } from '@/core/components/CommonHeaderSelect';
import { Form } from '@/core/components/Form';
import { NotificationCard } from '@/core/components/NotificationCard';
import { useFetchSystemDefaults } from '@/core/hooks/useFetchSystemDefaults';
import { cn } from '@/core/utils/style';
import { CreateUpdateSourceFormData } from '@/Sources/components/CreateUpdateSourceForm';
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
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  buildUnsetDefaultsPatch,
  hasOverrides as hasOverridesHelper,
  isDefaultOveridden,
} from './defaultSection.helpers';

export const DefaultsSection = ({
  formValidation,
  form,
  className,
}: {
  formValidation: Rule;
  form: FormInstance<CreateUpdateSourceFormData>;
  className?: string;
}) => {
  const { data: defaults, isLoading, error } = useFetchSystemDefaults();
  const { engines, isLoading: isLoadingEngines } = useFetchTableEngines();
  const defaultsAppliedRef = useRef(false);

  const headerType = Form.useWatch(['header', 'type'], form);
  const headerVersion = Form.useWatch(['header', 'version'], form);
  const ttlDays = Form.useWatch(['schema', 'ttl_days'], form);
  const engine = Form.useWatch(['schema', 'engine'], form);

  useEffect(() => {
    if (!defaults || defaultsAppliedRef.current) {
      return;
    }
    const patch = buildUnsetDefaultsPatch(
      {
        header: {
          type: form.getFieldValue(['header', 'type']),
          version: form.getFieldValue(['header', 'version']),
        },
        schema: {
          ttl_days: form.getFieldValue(['schema', 'ttl_days']),
          engine: form.getFieldValue(['schema', 'engine']),
        },
      },
      defaults,
    );
    if (patch.header || patch.schema) {
      form.setFieldsValue(patch);
    }
    defaultsAppliedRef.current = true;
  }, [defaults, form]);

  const hasOverrides = hasOverridesHelper({
    formValues: {
      header: {
        type: headerType,
        version: headerVersion,
      },
      schema: {
        ttl_days: ttlDays,
        engine,
      },
    },
    defaults,
  });
  // null = follow hasOverrides; once the user toggles, keep their choice
  const [manualEditing, setManualEditing] = useState<boolean | null>(null);
  const isEditing = manualEditing ?? hasOverrides;

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
          onClick={() => setManualEditing(!isEditing)}
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

      {!isLoading && !error && defaults && (
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
                    headerType,
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
                    headerVersion,
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
                  {isDefaultOveridden(ttlDays, defaults?.default_ttl_days) && (
                    <OverrideTag />
                  )}
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
                  {isDefaultOveridden(engine, defaults?.default_engine) && (
                    <OverrideTag />
                  )}
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
