import { Form } from '@/core/components/Form';
import {
  CreateUpdateSourceFormData,
  type DisabledFields,
} from '@/Sources/components/CreateUpdateSourceForm';
import { OriginFormSection } from '@/Sources/components/CreateUpdateSourceForm/SourceDetailsTabContent/OriginFormSection';
import { TransportSelect } from '@/Sources/components/TransportSelect';
import { FormInstance, FormRule, Input, Switch } from 'antd';

export const SourceDetailsTabContent = ({
  formValidation,
  disabledFields,
  form,
}: {
  formValidation: FormRule;
  disabledFields?: DisabledFields;
  form: FormInstance<CreateUpdateSourceFormData>;
}) => {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-x-2">
        <Form.Item
          className="w-full"
          name="source"
          label="Source Name"
          rules={[formValidation]}
        >
          <Input
            placeholder="Enter source"
            disabled={!!disabledFields?.source}
          />
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

      <Form.Item
        name="description"
        label="Description"
        rules={[formValidation]}
      >
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
          <TransportSelect />
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
        disabledFields={disabledFields}
      />
    </div>
  );
};
