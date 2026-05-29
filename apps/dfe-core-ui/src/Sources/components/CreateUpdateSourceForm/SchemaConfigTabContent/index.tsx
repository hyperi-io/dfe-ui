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
      <Radio.Group
        value={assignSchema}
        onChange={(e) => {
          setAssignSchema(e.target.value as AssignSchemaOptions);
        }}
      >
        <Radio value="default">Default</Radio>
        <Radio value="define_schema">Define Schema</Radio>
      </Radio.Group>

      {assignSchema === 'define_schema' && (
        <MetaSchemaForm formValidation={formValidation} form={form} />
      )}
    </div>
  );
};
