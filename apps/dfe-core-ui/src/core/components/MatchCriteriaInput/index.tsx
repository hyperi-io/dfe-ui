import { Radio } from 'antd';
import { useState } from 'react';
import { CelExpressionMatch } from './CelExpressionMatch';
import { SqlMatch } from './SqlMatch';
import { MatchConditionsEditor } from './WhenMatch/index';
import { TMatchFormNode } from './WhenMatch/WhenMatch.types';

type MatchCriteriaType = 'conditions' | 'expression' | 'sql';

interface MatchCriteriaInputProps {
  onChange?: (value?: string | TMatchFormNode) => void;
  onModeChange?: (mode: MatchCriteriaType) => void;
  modes?: MatchCriteriaType[];
}

export const MatchCriteriaInput = ({
  onChange,
  onModeChange,
  modes = ['conditions', 'expression', 'sql'],
}: MatchCriteriaInputProps) => {
  const [matchMode, setMatchMode] = useState<MatchCriteriaType>('conditions');

  const handleModeChange = (mode: MatchCriteriaType) => {
    setMatchMode(mode);
    onModeChange?.(mode);
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
        onChange={(e) => handleModeChange(e.target.value as MatchCriteriaType)}
      />
      {modes.includes('conditions') && matchMode === 'conditions' && (
        <MatchConditionsEditor
          value={null}
          onChange={(next) => onChange?.(next ?? undefined)}
        />
      )}
      {modes.includes('expression') && matchMode === 'expression' && (
        <CelExpressionMatch onChange={onChange} />
      )}
      {modes.includes('sql') && matchMode === 'sql' && (
        <SqlMatch onChange={onChange} />
      )}
    </div>
  );
};
