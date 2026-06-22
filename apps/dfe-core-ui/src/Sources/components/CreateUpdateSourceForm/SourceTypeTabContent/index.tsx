import { NotificationCard } from '@/core/components/NotificationCard';
import { IconInfoCircle } from '@repo/dfe-icons';
import { Form, FormInstance, FormRule, Input } from 'antd';
import { useState } from 'react';
import { CreateUpdateSourceFormData } from '..';
import { getInitialSourceType } from './helpers';

type SourceType = 'receiver' | 'fetcher';

export const SourceTypeTabContent = ({
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

  return (
    <div className="flex flex-col gap-2">
      <NotificationCard
        icon={<IconInfoCircle />}
        description="CEL expression to match the incoming data."
      />
      <div className="flex gap-x-2">
        {/* TODO: Add CEL expression editor */}
        <Form.Item
          className="w-full"
          name={['match', 'field']}
          label="Field"
          rules={[formValidation]}
        >
          <Input placeholder="Enter field" />
        </Form.Item>
        <Form.Item
          className="w-full"
          name={['match', 'value']}
          label="Value"
          rules={[formValidation]}
        >
          <Input placeholder="Enter value" />
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
