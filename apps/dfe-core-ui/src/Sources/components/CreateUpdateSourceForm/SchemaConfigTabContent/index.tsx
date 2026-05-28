import { Form } from '@/core/components/Form';
import { CreateUpdateSourceFormData } from '@/Sources/components/CreateUpdateSourceForm/sourceForm.schema';
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
import { MetaSchemaSelectCreate } from './MetaSchemaSelectCreate';

export const SchemaConfigTabContent = ({
  formValidation,
  form,
}: {
  formValidation: FormRule;
  form: FormInstance<CreateUpdateSourceFormData>;
}) => {
  const [versions, setVersions] = useState<string[]>([]);

  const handleChangeMetaSchema = useCallback(
    (
      value: string | null,
      meta?: { versions: string[] },
      action_type?: string,
    ) => {
      if (value) {
        setVersions(meta?.versions ?? []);

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

  const versionsOptions = useMemo(() => {
    return (
      versions?.map((version) => ({ label: version, value: version })) ?? []
    );
  }, [versions]);

  return (
    <div className="grid grid-cols-2 gap-2">
      <Form.Item
        className="w-full"
        name={['header', 'type']}
        label="Header Type"
        rules={[formValidation]}
      >
        <Select
          options={[
            { label: 'Timeseries', value: 'time_series' },
            { label: 'Minimal', value: 'minimal' },
            { label: 'Passthrough', value: 'passthrough' },
          ]}
          placeholder="Select header type"
          allowClear
        />
      </Form.Item>
      <Form.Item
        className="w-full"
        name={['header', 'version']}
        label="Header Version"
        rules={[formValidation]}
      >
        <Input placeholder="Enter header version" />
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
          options={versionsOptions}
          disabled={!versions?.length}
          placeholder={
            versions?.length
              ? 'Select meta schema version'
              : 'Select meta schema first to access versions'
          }
        />
      </Form.Item>
      <Form.Item
        className="w-full"
        name={['schema', 'derived_schema']}
        label={
          <>
            Derived Schema
            <span className="ml-1 text-foreground-muted/40 dark:text-foreground-muted/40">
              (Coming soon!)
            </span>
          </>
        }
        rules={[formValidation]}
      >
        <Input disabled placeholder="Enter derived schema" />
      </Form.Item>
      <Form.Item
        className="w-full"
        name={['schema', 'additional_fields']}
        label="Additional Fields"
        rules={[formValidation]}
      >
        <Input placeholder="Enter additional fields" />
      </Form.Item>

      <Form.Item
        className="w-full"
        name={['schema', 'engine']}
        label="Engine"
        rules={[formValidation]}
      >
        <Select
          placeholder="Enter engine"
          options={[
            { label: 'MergeTree', value: 'MergeTree' },
            { label: 'ReplicatedMergeTree', value: 'ReplicatedMergeTree' },
            { label: 'SharedMergeTree', value: 'SharedMergeTree' },
          ]}
        />
      </Form.Item>
      <Form.Item
        className="w-full"
        name={['schema', 'ttl_days']}
        label="TTL Days"
        rules={[formValidation]}
      >
        <InputNumber placeholder="Enter TTL days" />
      </Form.Item>
    </div>
  );
};
