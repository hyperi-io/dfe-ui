import { Form } from '@/core/components/Form';
import { cn } from '@/core/utils/style';
import { CreateUpdateSourceFormData } from '@/Sources/components/CreateUpdateSourceForm';
import { SourceOrigin } from '@/Sources/components/CreateUpdateSourceForm/sourceForm.schema';
import { FormInstance, FormRule, Radio } from 'antd';
import { FetcherFormSection } from './FetcherFormSection';
import { EMPTY_FETCHER, EMPTY_MATCH } from './helpers';
import { ReceiverFormSection } from './RecieverFormSection';

export const OriginFormSection = ({
  formValidation,
  form,
  className,
}: {
  formValidation: FormRule;
  form: FormInstance<CreateUpdateSourceFormData>;
  className?: string;
}) => {
  const origin = Form.useWatch('origin', form);

  // The engine takes exactly one origin, so the block being left behind goes
  // back to empty rather than travelling with the request.
  const handleOriginChange = (nextOrigin: SourceOrigin) => {
    form.setFieldsValue(
      nextOrigin === 'fetcher'
        ? { match: { ...EMPTY_MATCH } }
        : { fetcher: { ...EMPTY_FETCHER } },
    );
  };

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <Form.Item name="origin" label="Origin" rules={[formValidation]}>
        <Radio.Group
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
        <FetcherFormSection formValidation={formValidation} />
      )}
      {origin === 'receiver' && (
        <ReceiverFormSection formValidation={formValidation} form={form} />
      )}
    </div>
  );
};
