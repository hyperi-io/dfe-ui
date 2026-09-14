import { Form } from '@/core/components/Form';
import { NotificationCard } from '@/core/components/NotificationCard';
import { cn } from '@/core/utils/style';
import { CreateUpdateSourceFormData } from '@/Sources/components/CreateUpdateSourceForm';
import {
  MATCH_OPERATORS,
  SourceOrigin,
} from '@/Sources/components/CreateUpdateSourceForm/sourceForm.schema';
import { IconInfoCircle } from '@repo/dfe-icons';
import { FormInstance, FormRule, Input, Radio, Select } from 'antd';
import { FetcherFormSection } from './FetcherFormSection';
import { EMPTY_FETCHER, EMPTY_MATCH } from './helpers';

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
  const operationType = Form.useWatch(['match', 'operator'], form);
  const isMatchValueDisabled = operationType === 'exists';

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

      {origin === 'fetcher' ? (
        <FetcherFormSection formValidation={formValidation} />
      ) : (
        <>
          <NotificationCard
            icon={<IconInfoCircle />}
            description="Incoming data that matches the following criteria will be processed by this source"
          />
          <div className="flex gap-x-2">
            <Form.Item
              className="w-full"
              name={['match', 'field']}
              label={<Form.Label required>Field</Form.Label>}
              rules={[formValidation]}
            >
              <Input placeholder="Enter field" />
            </Form.Item>
            <Form.Item
              name={['match', 'operator']}
              label="Operator"
              className="min-w-36"
              rules={[formValidation]}
            >
              <Select
                placeholder="Select operator"
                onChange={(value) => {
                  if (value === 'exists') {
                    form.setFields([
                      {
                        name: ['match', 'value'],
                        errors: [],
                        value: '',
                      },
                    ]);
                  }
                }}
                options={MATCH_OPERATORS.map((operator) => ({
                  label: operator,
                  value: operator,
                }))}
              />
            </Form.Item>

            <Form.Item
              className="w-full"
              name={['match', 'value']}
              label="Value"
              rules={[formValidation]}
            >
              <Input
                disabled={isMatchValueDisabled}
                placeholder="Enter value"
              />
            </Form.Item>
          </div>
        </>
      )}
    </div>
  );
};
