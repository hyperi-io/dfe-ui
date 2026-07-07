import { Form } from '@/core/components/Form';
import {
  CreateUpdateSourceFormData,
  type DisabledFields,
} from '@/Sources/components/CreateUpdateSourceForm';
import { OriginFormSection } from '@/Sources/components/CreateUpdateSourceForm/SourceDetailsTabContent/OriginFormSection';
import { FormInstance, FormRule, Input, Switch } from 'antd';

export const SourceDetailsTabContent = ({
  formValidation,
  disabledFields,
  form,
}: {
  formValidation: FormRule;
  disabledFields?: DisabledFields;
  form: FormInstance<CreateUpdateSourceFormData>;
}) => (
  <div className="flex flex-col gap-2">
    <div className="flex gap-x-2">
      <Form.Item
        className="w-full"
        name="source"
        label="Source"
        rules={[formValidation]}
      >
        <Input placeholder="Enter source" disabled={!!disabledFields?.source} />
      </Form.Item>
      <Form.Item name="enabled" label="Enabled" rules={[formValidation]}>
        <Switch />
      </Form.Item>
    </div>

    <Form.Item
      name="display_name"
      label="Display Name"
      rules={[formValidation]}
    >
      <Input placeholder="Enter display name" />
    </Form.Item>

    <Form.Item name="description" label="Description" rules={[formValidation]}>
      <Input.TextArea placeholder="Enter description" />
    </Form.Item>

    <OriginFormSection
      formValidation={formValidation}
      form={form}
      className="mt-2"
    />
  </div>
);
