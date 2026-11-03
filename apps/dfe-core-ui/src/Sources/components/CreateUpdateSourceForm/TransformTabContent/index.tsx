import { Form } from '@/core/components/Form';
import { ExternalPipelineFields } from '@/Sources/components/CreateUpdateSourceForm/ExternalPipelineFields';
import { CreateUpdateSourceFormData } from '@/Sources/components/CreateUpdateSourceForm/sourceForm.schema';
import { FormRule, Radio, type FormInstance } from 'antd';
import { TransformForm } from './TransformForm';
import {
  AssignTransformOptions,
  EXTERNAL_ENGINE,
} from './TransformTabContent.helpers';

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
  const origin = Form.useWatch('origin', form);
  const sourceName = Form.useWatch('source', form) || '<source>';

  // An external transform is named by its engine alone, and a DFE transform must
  // not keep the reserved name, so the engine follows the choice.
  const handleAssignChange = (next: AssignTransformOptions) => {
    const engine = form.getFieldValue(['transform', 'engine']);
    if (next === 'external') {
      form.setFieldValue(['transform', 'engine'], EXTERNAL_ENGINE);
    } else if (engine === EXTERNAL_ENGINE) {
      form.setFieldValue(['transform', 'engine'], undefined);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <Form.Item
        name={['transform_ui_config', 'assign']}
        rules={[formValidation]}
        noStyle
      >
        <Radio.Group
          aria-label={TRANSFORM_LABEL}
          onChange={(event) =>
            handleAssignChange(event.target.value as AssignTransformOptions)
          }
          options={[
            { label: 'No Transform', value: 'none' },
            { label: 'Define Transform', value: 'define_transform' },
            {
              label: 'Your own pipeline',
              value: 'external',
              // Already the origin: that pipeline transforms before it writes.
              disabled: origin === 'external',
            },
          ]}
        />
      </Form.Item>

      {assignTransform === 'define_transform' && (
        <TransformForm formValidation={formValidation} />
      )}
      {assignTransform === 'external' && (
        <>
          <Form.Item name={['transform', 'engine']} hidden>
            <input type="hidden" />
          </Form.Item>
          <ExternalPipelineFields
            prefix="transform"
            formValidation={formValidation}
            summary={`Your Vector, Fluentd or Logstash reads ${sourceName}_land in the consumer group dfe-external-${sourceName} and writes ${sourceName}_load on Kafka. DFE creates both topics and deploys no transform.`}
          />
        </>
      )}
    </div>
  );
};
