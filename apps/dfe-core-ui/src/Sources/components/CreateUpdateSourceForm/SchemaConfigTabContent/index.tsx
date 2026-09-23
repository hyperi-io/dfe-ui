import { Form } from '@/core/components/Form';
import { RbacProtected } from '@/core/components/RbacProtected';
import { CreateUpdateSourceFormData } from '@/Sources/components/CreateUpdateSourceForm/sourceForm.schema';
import { FormInstance, FormRule, Radio } from 'antd';
import { useState } from 'react';
import { MetaSchemaForm } from './MetaSchemaForm';
import { getInitialAssignSchema } from './SchemaConfigTabContent.helpers';

type AssignSchemaOptions = 'default' | 'define_schema';
export const SchemaConfigTabContent = ({
  formValidation,
  form,
}: {
  formValidation: FormRule;
  form: FormInstance<CreateUpdateSourceFormData>;
}) => {
  const initialMetaSchema = form.getFieldValue('schema')?.meta_schema;
  const initialAssignSchema = getInitialAssignSchema({
    meta_schema: initialMetaSchema,
  });
  const [assignSchema, setAssignSchema] =
    useState<AssignSchemaOptions>(initialAssignSchema);

  return (
    <div className="flex flex-col gap-2">
      <Form.Item name="_assignSchema" label="Assign Schema">
        <Radio.Group
          value={assignSchema}
          onChange={(e) => {
            setAssignSchema(e.target.value as AssignSchemaOptions);
          }}
        >
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
