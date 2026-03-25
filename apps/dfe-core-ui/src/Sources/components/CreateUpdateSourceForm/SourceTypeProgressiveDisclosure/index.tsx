import { FormInstance, FormRule, Radio } from 'antd';
import { useState } from 'react';
import { CreateUpdateSourceFormData } from '..';
import { FetcherForm } from './FetcherForm';
import { ReceiverForm } from './ReceiverForm';
import { getInitialSourceType } from './helpers';

type SourceType = 'receiver' | 'fetcher';

export const SourceTypeProgressiveDisclosure = ({
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
