import { Form } from '@/core/components/Form';
import { CreateUpdateSourceFormData } from '@/Sources/components/CreateUpdateSourceForm/sourceForm.schema';
import { IconInfoCircle } from '@repo/dfe-icons';
import { Button, FormInstance, FormRule, Popover, Select } from 'antd';
import Link from 'next/link';
import { useCallback, useMemo, useState } from 'react';
import { DefaultsSection } from './DefaultsSection';
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

  return (
    <div className="grid grid-cols-2 gap-2">
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

      <DefaultsSection
        className="col-span-2 mt-2"
        formValidation={formValidation}
        form={form}
      />
    </div>
  );
};
