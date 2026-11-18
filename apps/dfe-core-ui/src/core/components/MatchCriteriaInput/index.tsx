import { Radio } from 'antd';
import { useState } from 'react';
import { CelExpressionMatch } from './CelExpressionMatch';
import { SqlMatch } from './SqlMatch';
import { WhenMatch } from './WhenMatch';

type MatchCriteriaType = 'conditions' | 'expression' | 'sql';

interface MatchCriteriaInputProps {
  onChange?: (value?: string) => void;
  onTypeChange?: (type: MatchCriteriaType) => void;
}

export const MatchCriteriaInput = ({
  onChange,
  onTypeChange,
}: MatchCriteriaInputProps) => {
  const [matchMode, setMatchMode] = useState<MatchCriteriaType>('conditions');

  const handleTypeChange = (type: MatchCriteriaType) => {
    setMatchMode(type);
    onTypeChange?.(type);
  };

  return (
    <div className="flex flex-col gap-2">
      <Radio.Group
        aria-label="Match mode"
        optionType="button"
        options={[
          { label: 'Conditions', value: 'conditions' },
          { label: 'CEL Fast expression', value: 'expression' },
          { label: 'SQL', value: 'sql' },
        ]}
        onChange={(e) => handleTypeChange(e.target.value as MatchCriteriaType)}
      />
      {matchMode === 'conditions' && <WhenMatch onChange={onChange} />}
      {matchMode === 'expression' && <CelExpressionMatch onChange={onChange} />}
      {matchMode === 'sql' && <SqlMatch onChange={onChange} />}
    </div>
  );
};
