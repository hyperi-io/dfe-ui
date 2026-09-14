import { Form } from '@/core/components/Form';
import {
  CreateUpdateSourceFormData,
  type DisabledFields,
} from '@/Sources/components/CreateUpdateSourceForm';
import { OriginFormSection } from '@/Sources/components/CreateUpdateSourceForm/SourceDetailsTabContent/OriginFormSection';
import {
  SOURCE_TRANSPORT_LABELS,
  SOURCE_TRANSPORTS,
} from '@/Sources/components/CreateUpdateSourceForm/sourceForm.schema';
import { FormInstance, FormRule, Input, Select, Switch } from 'antd';

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
        label={<Form.Label required>Source Name</Form.Label>}
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

    <div className="flex gap-x-2">
      <Form.Item
        className="w-full"
        name="transport"
        label="Transport"
        // The effective transport and the reason a choice was refused are on
        // the source's Flow, which resolves both against the deployment.
        extra="Leave inherited to follow the deployment default."
        rules={[formValidation]}
      >
        <Select
          allowClear
          placeholder="Inherit the deployment default"
          options={SOURCE_TRANSPORTS.map((transport) => ({
            value: transport,
            label: SOURCE_TRANSPORT_LABELS[transport],
          }))}
        />
      </Form.Item>
      <Form.Item
        name="archive"
        label="Archive"
        extra="Needs the bus."
        rules={[formValidation]}
      >
        <Switch />
      </Form.Item>
    </div>

    <OriginFormSection
      formValidation={formValidation}
      form={form}
      className="mt-2"
    />
  </div>
);
