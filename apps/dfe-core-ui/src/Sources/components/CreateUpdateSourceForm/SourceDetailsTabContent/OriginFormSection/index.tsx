import { Form } from '@/core/components/Form';
import { cn } from '@/core/utils/style';
import {
  CreateUpdateSourceFormData,
  DisabledFields,
} from '@/Sources/components/CreateUpdateSourceForm';
import { SourceOrigin } from '@/Sources/components/CreateUpdateSourceForm/sourceForm.schema';
import { ExternalPipelineFields } from '@/Sources/components/CreateUpdateSourceForm/ExternalPipelineFields';
import { FormInstance, FormRule, Radio } from 'antd';
import { FetcherFormSection } from './FetcherFormSection';
import {
  EMPTY_EXTERNAL,
  EMPTY_FETCHER,
  EMPTY_MATCH,
  EMPTY_RECEIVER_UI_CONFIG,
} from './helpers';
import { ReceiverFormSection } from './RecieverFormSection';

/** A label's `for` cannot name a radio group, so the group carries the same text itself. */
const ORIGIN_LABEL = 'Origin';

export const OriginFormSection = ({
  formValidation,
  form,
  className,
  disabledFields,
}: {
  formValidation: FormRule;
  form: FormInstance<CreateUpdateSourceFormData>;
  className?: string;
  disabledFields?: DisabledFields;
}) => {
  const origin = Form.useWatch('origin', form);
  const sourceName = Form.useWatch('source', form);

  // The engine takes exactly one origin, so every block but the chosen one goes
  // back to empty rather than travelling with the request.
  const handleOriginChange = (nextOrigin: SourceOrigin) => {
    form.setFieldsValue({
      receiver_ui_config: { ...EMPTY_RECEIVER_UI_CONFIG },
      ...(nextOrigin === 'receiver' ? {} : { match: { ...EMPTY_MATCH } }),
      ...(nextOrigin === 'fetcher' ? {} : { fetcher: { ...EMPTY_FETCHER } }),
      ...(nextOrigin === 'external' ? {} : { external: { ...EMPTY_EXTERNAL } }),
    });
  };

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <Form.Item name="origin" label={ORIGIN_LABEL} rules={[formValidation]}>
        <Radio.Group
          aria-label={ORIGIN_LABEL}
          disabled={disabledFields?.origin}
          onChange={(event) =>
            handleOriginChange(event.target.value as SourceOrigin)
          }
          options={[
            { label: 'Receiver', value: 'receiver' },
            { label: 'Fetcher', value: 'fetcher' },
            { label: 'Your own pipeline', value: 'external' },
          ]}
        />
      </Form.Item>

      {origin === 'fetcher' && (
        <FetcherFormSection
          disabledFields={disabledFields}
          formValidation={formValidation}
        />
      )}
      {origin === 'external' && (
        <ExternalPipelineFields
          prefix="external"
          formValidation={formValidation}
          summary={`Your Vector, Fluentd or Logstash produces to ${sourceName || '<source>'}_land on Kafka, past the receiver. Kafka only, and DFE creates the topic.`}
        />
      )}
      {origin === 'receiver' && (
        <ReceiverFormSection
          disabledFields={disabledFields}
          formValidation={formValidation}
          form={form}
        />
      )}
    </div>
  );
};
