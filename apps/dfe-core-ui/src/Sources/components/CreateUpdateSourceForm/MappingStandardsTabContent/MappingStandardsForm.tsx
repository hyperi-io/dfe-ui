import { CreateUpdateSourceFormData } from '@/Sources/components/CreateUpdateSourceForm/sourceForm.schema';
import { CreateFieldMapDrawer } from '@/core/components/CreateFieldMapDrawer';
import { FieldMapSelect } from '@/core/components/FieldMapSelect';
import { Form } from '@/core/components/Form';
import { FormInstance, FormRule } from 'antd';

export const MappingStandardsForm = ({
  formValidation,
  form,
  initialValues,
}: {
  formValidation: FormRule;
  form: FormInstance<CreateUpdateSourceFormData>;
  initialValues?: CreateUpdateSourceFormData;
}) => {
  return (
    <div className="flex gap-x-2">
      <Form.Item
        name="mapping_standards"
        className="w-full"
        label="Mapping Standards"
        rules={[formValidation]}
      >
        <FieldMapSelect
          placeholder="Select mapping standards"
          mode="multiple"
          allowClear
        />
      </Form.Item>

      <CreateFieldMapDrawer
        title="Create New Standard"
        className={{ trigger: 'mt-auto' }}
        onSuccess={({ standard, source }) => {
          form.setFieldsValue({
            mapping_standards: [
              ...form.getFieldValue('mapping_standards'),
              `${standard}:${source}`,
            ],
          });
        }}
        initialValues={{
          standard: '',
          source: initialValues?.source,
        }}
        disabledFields={{
          source: !!initialValues?.source,
        }}
      />
    </div>
  );
};
