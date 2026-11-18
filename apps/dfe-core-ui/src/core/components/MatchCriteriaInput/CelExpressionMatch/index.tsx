import { AceEditor } from '@/core/components/AceEditor';
import { FormNotification } from '@/core/components/FormNotification';
import { useCheckCel } from '@/core/hooks/useCelCheck';
import { IconCheck, IconX } from '@repo/dfe-icons';
import { Button } from 'antd';
import { useState } from 'react';

const EXAMPLE = "data_stream.dataset == 'okta.system'";

export const CelExpressionMatch = ({
  onChange,
}: {
  onChange?: (value?: string) => void;
}) => {
  const [expression, setExpression] = useState('');

  const {
    data,
    mutate: checkCel,
    isPending,
    error,
    reset: resetCheckCel,
  } = useCheckCel();

  const handleExpressionChange = (value: string) => {
    setExpression(value);
    resetCheckCel();
    onChange?.(value);
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-end absolute top-12 right-2 z-10">
        <Button
          disabled={data?.valid}
          icon={data?.valid ? <IconCheck /> : <IconX />}
          danger={!data?.valid}
          type={data?.valid ? 'primary' : 'default'}
          color={data?.valid ? 'green' : 'blue'}
          loading={isPending}
          htmlType="button"
          onClick={() => checkCel({ expression, check_profile: true })}
        >
          Check Expression
        </Button>
      </div>

      <AceEditor
        mode="cel"
        className="min-h-14"
        placeholder={EXAMPLE}
        minLines={2}
        maxLines={8}
        value={expression}
        onChange={handleExpressionChange}
      />
      {!data?.valid && (
        <FormNotification text={data?.errors?.join(', ')} type="error" />
      )}
      {error && (
        <FormNotification
          title="Error checking expression"
          text={error.message}
          type="error"
        />
      )}
    </div>
  );
};
