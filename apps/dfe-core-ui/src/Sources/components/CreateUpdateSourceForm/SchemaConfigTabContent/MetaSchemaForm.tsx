import { Form } from '@/core/components/Form';
import { useFetchSetupStatus } from '@/core/hooks/useFetchSetupStatus';
import { CreateUpdateSourceFormData } from '@/Sources/components/CreateUpdateSourceForm/sourceForm.schema';
import {
  dfeDefaultText,
  OverrideTag,
  ttlDaysText,
} from '@/Sources/components/DefaultOverride';
import { IconInfoCircle } from '@repo/dfe-icons';
import {
  Button,
  FormInstance,
  FormRule,
  Input,
  InputNumber,
  Popover,
  Select,
} from 'antd';
import Link from 'next/link';
import { useCallback, useMemo, useState } from 'react';
import { CommonHeaderSelect } from './CommonHeaderSelect';
import { MetaSchemaSelectCreate } from './MetaSchemaSelectCreate';

export const MetaSchemaForm = ({
  formValidation,
  form,
}: {
  formValidation: FormRule;
  form: FormInstance<CreateUpdateSourceFormData>;
}) => {
  const [metaSchemaVersions, setMetaSchemaVersions] = useState<string[]>([]);
  const handleChangeMetaSchema = useCallback(
    (
      value: string | null,
      meta?: { versions: string[] },
      action_type?: string,
    ) => {
      if (value) {
        setMetaSchemaVersions(meta?.versions ?? []);

        if (action_type === '_select') {
          form.setFieldsValue({
            schema: {
              meta_schema_version:
                meta?.versions?.length === 1 ? meta?.versions?.[0] : undefined,
            },
          });
        }
      }
    },
    [form],
  );
  const metaSchemaVersionsOptions = useMemo(() => {
    return (
      metaSchemaVersions?.map((version) => ({
        label: version,
        value: version,
      })) ?? []
    );
  }, [metaSchemaVersions]);

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

  const { data: setupStatus } = useFetchSetupStatus();
  // Blank follows the DFE default; a value is a sticky override of it.
  const ttlDays = Form.useWatch(['schema', 'ttl_days'], form);
  const engine = Form.useWatch(['schema', 'engine'], form);
  const isTtlOverride = ttlDays !== undefined && ttlDays !== null;

  return (
    <div className="grid grid-cols-2 gap-2">
      <Form.Item
        className="w-full"
        name={['header', 'type']}
        /**
         * Validate on blur to prevent form submission when clearing the meta schema
         */
        validateTrigger={['onBlur']}
        label={<Form.Label required>Header Type</Form.Label>}
        rules={[formValidation]}
      >
        <CommonHeaderSelect onChange={handleChangeCommonHeader} />
      </Form.Item>

      <Form.Item
        className="w-full"
        name={['header', 'version']}
        label={<Form.Label required>Header Version</Form.Label>}
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
        name={['schema', 'meta_schema']}
        /**
         * Validate on blur to prevent form submission when clearing the meta schema
         */
        validateTrigger={['onBlur']}
        label={
          <Form.Label required>
            Meta Schema{' '}
            <Popover
              destroyOnHidden
              title={<span className="text-sm">Meta Schema Configuration</span>}
              content={
                <>
                  For more advanced configuration, please use
                  <Link className="mx-1" href="/schemas" target="_blank">
                    Schemas
                  </Link>
                  management portal.
                </>
              }
            >
              <Button
                className="ml-1"
                type="text"
                shape="circle"
                size="small"
                icon={<IconInfoCircle />}
              />
            </Popover>
          </Form.Label>
        }
        rules={[formValidation]}
      >
        <MetaSchemaSelectCreate onChange={handleChangeMetaSchema} />
      </Form.Item>
      <Form.Item
        className="w-full"
        name={['schema', 'meta_schema_version']}
        label={<Form.Label required>Meta Schema Version</Form.Label>}
        rules={[formValidation]}
      >
        <Select
          options={metaSchemaVersionsOptions}
          disabled={!metaSchemaVersions?.length}
          placeholder={
            metaSchemaVersions?.length
              ? 'Select meta schema version'
              : 'Select meta schema first to access versions'
          }
        />
      </Form.Item>
      <Form.Item
        className="w-full"
        name={['schema', 'ttl_days']}
        label={
          <span className="flex items-center gap-2">
            TTL Days {isTtlOverride && <OverrideTag />}
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
            ttlDaysText(setupStatus?.default_ttl_days),
          )}
        />
      </Form.Item>
      <Form.Item
        className="w-full"
        name={['schema', 'engine']}
        label={
          <span className="flex items-center gap-2">
            Engine {engine && <OverrideTag />}
          </span>
        }
        rules={[formValidation]}
      >
        <Input
          allowClear
          placeholder={dfeDefaultText(setupStatus?.default_engine)}
        />
      </Form.Item>
    </div>
  );
};
