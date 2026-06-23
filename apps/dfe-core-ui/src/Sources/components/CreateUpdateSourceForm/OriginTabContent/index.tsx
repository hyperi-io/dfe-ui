import { Form } from '@/core/components/Form';
import { NotificationCard } from '@/core/components/NotificationCard';
import { IconInfoCircle } from '@repo/dfe-icons';
import { FormInstance, FormRule, Input, Select } from 'antd';
import { useState } from 'react';
import { CreateUpdateSourceFormData } from '..';
import { getInitialSourceType, OPERATORS } from './helpers';

type SourceType = 'receiver' | 'fetcher';

export const OriginTabContent = ({
  formValidation,
  form,
}: {
  formValidation: FormRule;
  form: FormInstance<CreateUpdateSourceFormData>;
}) => {
  const initialMatch = form.getFieldValue('match');
  const initialFetcher = form.getFieldValue('fetcher');
  const initialSourceType = getInitialSourceType({
    match: initialMatch,
    fetcher: initialFetcher,
  });
  const [_sourceType, _setSourceType] = useState<SourceType | null>(
    initialSourceType,
  );

  const operationType = Form.useWatch(['match', 'operator'], form);
  const isMatchValueDisabled = operationType === 'exists';

  return (
    <div className="flex flex-col gap-2">
      <NotificationCard
        icon={<IconInfoCircle />}
        description="Incoming data that matches the following criteria will be processed by this source"
      />
      <div className="flex gap-x-2">
        <Form.Item
          className="w-full"
          name={['match', 'field']}
          label="Field"
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
            onChange={() => {
              form.setFields([
                {
                  name: ['match', 'value'],
                  errors: [],
                  value: '',
                },
              ]);
            }}
            options={OPERATORS.map((operator) => ({
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
          <Input disabled={isMatchValueDisabled} placeholder="Enter value" />
        </Form.Item>
      </div>

      {/* <Radio.Group
        value={sourceType}
        onChange={(e) => {
          setSourceType(e.target.value as SourceType);
        }}
      >
        <Radio value="fetcher">Fetcher</Radio>
      </Radio.Group>

      {sourceType === 'fetcher' && (
        <FetcherForm formValidation={formValidation} form={form} />
      )} */}
    </div>
  );
};
