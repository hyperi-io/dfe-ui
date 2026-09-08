import { Form } from '@/core/components/Form';
import { useFetchSetupStatus } from '@/core/hooks/useFetchSetupStatus';
import { CreateUpdateSourceFormData } from '@/Sources/components/CreateUpdateSourceForm/sourceForm.schema';
import { IconInfoCircle } from '@repo/dfe-icons';
import {
  Button,
  FormInstance,
  FormRule,
  InputNumber,
  Popover,
  Select,
} from 'antd';
import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
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
  const defaultTtlDays = setupStatus?.default_ttl_days;
  // A source with no schema yet is new here; an existing source keeps its own value.
  const [seedDefaultTtl] = useState(
    () => form.getFieldValue('schema') === undefined,
  );
  useEffect(() => {
    if (!seedDefaultTtl || defaultTtlDays === undefined) return;
    if (form.getFieldValue(['schema', 'ttl_days']) !== undefined) return;
    form.setFieldsValue({ schema: { ttl_days: defaultTtlDays } });
  }, [form, seedDefaultTtl, defaultTtlDays]);
  const ttlHelp =
    defaultTtlDays === undefined
      ? undefined
      : `Deployment default: ${defaultTtlDays} days. ${seedDefaultTtl ? 'Leave as is' : 'Clear'} to follow it.`;

  return (
    <div className="grid grid-cols-2 gap-2">
      <Form.Item
        className="w-full"
        name={['header', 'type']}
        /**
         * Validate on blur to prevent form submission when clearing the meta schema
         */
        validateTrigger={['onBlur']}
        label="Header Type"
        rules={[formValidation]}
      >
        <CommonHeaderSelect onChange={handleChangeCommonHeader} />
      </Form.Item>

      <Form.Item
        className="w-full"
        name={['header', 'version']}
        label="Header Version"
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
          <>
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
          </>
        }
        rules={[formValidation]}
      >
        <MetaSchemaSelectCreate onChange={handleChangeMetaSchema} />
      </Form.Item>
      <Form.Item
        className="w-full"
        name={['schema', 'meta_schema_version']}
        label="Meta Schema Version"
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
        label="TTL Days"
        help={ttlHelp}
        rules={[formValidation]}
      >
        <InputNumber
          className="w-full"
          min={0}
          precision={0}
          placeholder="Enter TTL days"
        />
      </Form.Item>
    </div>
  );
};
