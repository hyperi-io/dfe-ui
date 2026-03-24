import { FormInstance, FormRule, Radio } from 'antd';
import { useState } from 'react';
import { CreateUpdateSourceFormData } from '..';
import { FetcherForm } from './FetcherForm';
import { ReceiverForm } from './ReceiverForm';

type SourceType = 'receiver' | 'fetcher';

const getInitialSourceType = (match: unknown, fetcher: unknown) => {
  if (match && fetcher) {
    return null;
  }

  if (match) {
    return 'receiver';
  }

  if (fetcher) {
    return 'fetcher';
  }
  return null;
};

export const SourceTypeProgressiveDisclosure = ({
  formValidation,
  form,
}: {
  formValidation: FormRule;
  form: FormInstance<CreateUpdateSourceFormData>;
}) => {
  const initialMatch = form.getFieldValue('match');
  const initialFetcher = form.getFieldValue('fetcher');
  const initialSourceType = getInitialSourceType(initialMatch, initialFetcher);
  const [sourceType, setSourceType] = useState<SourceType | null>(
    initialSourceType,
  );
  return (
    <div className="flex flex-col gap-2">
      <Radio.Group
        value={sourceType}
        onChange={(e) => {
          setSourceType(e.target.value as SourceType);
        }}
      >
        <Radio value="receiver">Receiver</Radio>
        <Radio value="fetcher">Fetcher</Radio>
      </Radio.Group>
      {sourceType === 'receiver' && (
        <ReceiverForm formValidation={formValidation} />
      )}
      {sourceType === 'fetcher' && (
        <FetcherForm formValidation={formValidation} form={form} />
      )}
    </div>
  );
};
