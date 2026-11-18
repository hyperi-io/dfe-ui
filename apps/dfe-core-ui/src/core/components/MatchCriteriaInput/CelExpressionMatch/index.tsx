import { AceEditor } from '@/core/components/AceEditor';
import { useState } from 'react';

const EXAMPLE = "data_stream.dataset == 'okta.system'";

export const CelExpressionMatch = ({
  onChange,
}: {
  onChange?: (value?: string) => void;
}) => {
  const [expression, setExpression] = useState('');

  const handleExpressionChange = (value: string) => {
    setExpression(value);
    onChange?.(value);
  };

  return (
    <div className="flex flex-col gap-2">
      <AceEditor
        mode="cel"
        placeholder={EXAMPLE}
        minLines={2}
        maxLines={8}
        value={expression}
        onChange={handleExpressionChange}
      />
    </div>
  );
};
