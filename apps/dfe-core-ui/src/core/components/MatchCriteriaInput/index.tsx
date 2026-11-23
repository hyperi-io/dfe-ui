import { Radio } from 'antd';
import { useState } from 'react';
import { CelExpressionMatch } from './CelExpressionMatch';
import { SqlMatch } from './SqlMatch';
import { MatchConditionsEditor } from './WhenMatch/index';
import { TMatchFormNode, TMatchOperator } from './WhenMatch/WhenMatch.types';

type MatchCriteriaType = 'conditions' | 'expression' | 'sql';
export type ValidateCel = {
  data: {
    valid: boolean;
    errors: string[];
    [key: string]: unknown;
  } | null;
  mutate: (expression: string) => void;
  isPending: boolean;
  error: Error | null;
  reset: () => void;
};
export type ValidateSql = {
  data: {
    valid: boolean;
    errors: {
      message: string;
      suggestion: string;
    }[];
  } | null;
  mutate: (sql: string) => void;
  isPending: boolean;
  error: Error | null;
  reset: () => void;
};
interface MatchCriteriaInputProps {
  onChange?: (value?: string | TMatchFormNode) => void;
  onModeChange?: (mode: MatchCriteriaType) => void;
  modes?: MatchCriteriaType[];
  operatorOptions: { label: string; value: TMatchOperator }[];
  matchDepthLimit: number;
  validate: {
    cel: ValidateCel;
    sql: ValidateSql;
  };
}

export const MatchCriteriaInput = ({
  onChange,
  onModeChange,
  modes = ['conditions', 'expression', 'sql'],
  operatorOptions,
  matchDepthLimit = 4,
  validate,
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
          operatorOptions={operatorOptions}
          matchDepthLimit={matchDepthLimit}
        />
      )}
      {modes.includes('expression') && matchMode === 'expression' && (
        <CelExpressionMatch onChange={onChange} validateCel={validate.cel} />
      )}
      {modes.includes('sql') && matchMode === 'sql' && (
        <SqlMatch onChange={onChange} validateSql={validate.sql} />
      )}
    </div>
  );
};
