import { Form } from '@/core/components/Form';
import { CreateUpdateSourceFormData } from '@/Sources/components/CreateUpdateSourceForm/sourceForm.schema';
import { FormRule, Radio, type FormInstance } from 'antd';
import { TransformForm } from './TransformForm';

/** A label's `for` cannot name a radio group, so the group carries the same text itself. */
const TRANSFORM_LABEL = 'Transform';

export const TransformTabContent = ({
  formValidation,
  form,
}: {
  formValidation: FormRule;
  form: FormInstance<CreateUpdateSourceFormData>;
}) => {
  const assignTransform = Form.useWatch(
    ['transform_ui_config', 'assign'],
    form,
  );
  return (
    <div className="flex flex-col gap-2">
      <Form.Item name={['transform_ui_config', 'assign']} noStyle>
        <Radio.Group aria-label={TRANSFORM_LABEL}>
          <Radio value="none">No Transform</Radio>
          <Radio value="define_transform">Define Transform</Radio>
        </Radio.Group>
      </Form.Item>

      {assignTransform === 'define_transform' && (
        <TransformForm formValidation={formValidation} />
      )}
    </div>
  );
};
