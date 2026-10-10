import { Form } from '@/core/components/Form';
import { cn } from '@/core/utils/style';
import {
  CreateUpdateSourceFormData,
  DisabledFields,
} from '@/Sources/components/CreateUpdateSourceForm';
import { SourceOrigin } from '@/Sources/components/CreateUpdateSourceForm/sourceForm.schema';
import { FormInstance, FormRule, Radio } from 'antd';
import { FetcherFormSection } from './FetcherFormSection';
import {
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

  // The engine takes exactly one origin, so the block being left behind goes
  // back to empty rather than travelling with the request.
  const handleOriginChange = (nextOrigin: SourceOrigin) => {
    form.setFieldsValue(
      nextOrigin === 'fetcher'
        ? {
            match: { ...EMPTY_MATCH },
            receiver_ui_config: { ...EMPTY_RECEIVER_UI_CONFIG },
          }
        : {
            fetcher: { ...EMPTY_FETCHER },
            receiver_ui_config: { ...EMPTY_RECEIVER_UI_CONFIG },
          },
    );
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
          ]}
        />
      </Form.Item>

      {origin === 'fetcher' && (
        <FetcherFormSection
          disabledFields={disabledFields}
          formValidation={formValidation}
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
