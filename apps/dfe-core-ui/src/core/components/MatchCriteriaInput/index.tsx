import { Radio } from 'antd';
import { ReactNode, useState } from 'react';
import { CelExpressionMatch } from './CelExpressionMatch';
import { SqlMatch } from './SqlMatch';
import { MatchConditionsEditor } from './WhenMatch/index';
import {
  FieldPath,
  TMatchFormNode,
  TMatchOperator,
} from './WhenMatch/WhenMatch.types';

export type CriteriaFieldIssue = {
  path: FieldPath;
  message: string;
};

const INPUT_ISSUE = new Set(['field', 'operator', 'value', 'parts']);

export type MatchCriteriaType = 'conditions' | 'expression' | 'sql';

/** The mode a saved rule should open on. A filled SQL or CEL value wins. */
export const matchCriteriaMode = (values?: {
  match?: unknown;
  cel_filter?: string | null;
  user_sql?: string | null;
}): MatchCriteriaType => {
  if (values?.user_sql?.trim()) return 'sql';
  if (values?.cel_filter?.trim()) return 'expression';
  return 'conditions';
};
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
  value?: string | TMatchFormNode | null;
  onChange?: (value?: string | TMatchFormNode) => void;
  /** The mode to show. The selected tab stays highlighted. */
  mode?: MatchCriteriaType;
  onModeChange?: (mode: MatchCriteriaType) => void;
  modes?: MatchCriteriaType[];
  operatorOptions: { label: string; value: TMatchOperator }[];
  matchDepthLimit: number;
  validate: {
    cel: ValidateCel;
    sql: ValidateSql;
  };
  /** Shown beside the mode switch, for every mode. */
  actions?: ReactNode;
  /** Problems with the criteria currently on screen. */
  issues?: CriteriaFieldIssue[];
}

export const MatchCriteriaInput = ({
  value,
  onChange,
  mode,
  onModeChange,
  modes = ['conditions', 'expression', 'sql'],
  operatorOptions,
  matchDepthLimit = 4,
  validate,
  actions,
  issues,
}: MatchCriteriaInputProps) => {
  const [matchMode, setMatchMode] = useState<MatchCriteriaType>(
    mode ?? 'conditions',
  );
  const selectedMode = mode ?? matchMode;

  const handleModeChange = (next: MatchCriteriaType) => {
    setMatchMode(next);
    onModeChange?.(next);
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-2">
        <Radio.Group
          aria-label="Match mode"
          optionType="button"
          value={selectedMode}
          options={[
            { label: 'Conditions', value: 'conditions' },
            { label: 'CEL Fast expression', value: 'expression' },
            { label: 'SQL', value: 'sql' },
          ]}
          onChange={(e) =>
            handleModeChange(e.target.value as MatchCriteriaType)
          }
        />
        {actions}
      </div>
      {modes.includes('conditions') && selectedMode === 'conditions' && (
        <MatchConditionsEditor
          value={value != null && typeof value === 'object' ? value : null}
          onChange={(next) => onChange?.(next ?? undefined)}
          operatorOptions={operatorOptions}
          matchDepthLimit={matchDepthLimit}
          issues={issues}
        />
      )}
      {modes.includes('expression') && selectedMode === 'expression' && (
        <CelExpressionMatch
          value={typeof value === 'string' ? value : undefined}
          onChange={onChange}
          validateCel={validate.cel}
        />
      )}
      {modes.includes('sql') && selectedMode === 'sql' && (
        <SqlMatch
          value={typeof value === 'string' ? value : undefined}
          onChange={onChange}
          validateSql={validate.sql}
        />
      )}
      {issues
        ?.filter((issue) => !INPUT_ISSUE.has(String(issue.path.at(-1))))
        .map((issue) => (
          <p
            key={`${issue.path.join('.')}:${issue.message}`}
            className="text-xs text-error"
          >
            {issue.message}
          </p>
        ))}
    </div>
  );
};
