import { Form } from '@/core/components/Form';
import { RbacProtected } from '@/core/components/RbacProtected';
import { CreateUpdateSourceFormData } from '@/Sources/components/CreateUpdateSourceForm/sourceForm.schema';
import { FormInstance, FormRule, Radio } from 'antd';
import { MetaSchemaForm } from './MetaSchemaForm';

export const SchemaConfigTabContent = ({
  formValidation,
  form,
}: {
  formValidation: FormRule;
  form: FormInstance<CreateUpdateSourceFormData>;
}) => {
  // Read from the form, not local state: the submitted fetcher topic is derived from this same field.
  const assignSchema =
    Form.useWatch('_assignSchema', form) ?? form.getFieldValue('_assignSchema');

  return (
    <div className="flex flex-col gap-2">
      <Form.Item name="_assignSchema" label="Assign Schema">
        <Radio.Group>
          {/* The shared landing table is dfe.main, so the choice is named for it. */}
          <Radio value="default">main</Radio>
          <Radio value="define_schema">Define Schema</Radio>
        </Radio.Group>
      </Form.Item>

      {assignSchema === 'define_schema' && (
        <RbacProtected action={RbacProtected.rbacActions.schema_read}>
          <RbacProtected.Unrestricted>
            <MetaSchemaForm formValidation={formValidation} form={form} />
          </RbacProtected.Unrestricted>
          <RbacProtected.Restricted>
            <RbacProtected.RestrictedRoute />
          </RbacProtected.Restricted>
        </RbacProtected>
      )}
    </div>
  );
};
