import { Input, Select } from 'antd';
import { FieldMessage } from './FieldMessage';
import { issueMessage, operatorTakesValue } from './WhenMatch.helpers';
import { FieldPath, TMatchFormNode, TMatchOperator } from './WhenMatch.types';

export const SingleCondition = ({
  value: valueProp,
  onChange,
  operatorOptions,
  issues,
}: {
  value: TMatchFormNode | null;
  onChange: (value: TMatchFormNode | null) => void;
  operatorOptions: { label: string; value: TMatchOperator }[];
  issues?: { path: FieldPath; message: string }[];
}) => {
  const value = valueProp ?? {};
  const takesValue = operatorTakesValue(value.operator);
  const fieldError = issueMessage(issues, ['field']);
  const operatorError = issueMessage(issues, ['operator']);
  const valueError = issueMessage(issues, ['value']);

  const handleChange = (next: TMatchFormNode | null) => {
    onChange(next);
  };

  return (
    <div className="flex items-start gap-x-2">
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <Input
          status={fieldError ? 'error' : undefined}
          value={value.field ?? ''}
          onChange={(e) => handleChange({ ...value, field: e.target.value })}
          placeholder="Enter field"
        />
        <FieldMessage message={fieldError} />
      </div>

      <div className="flex w-36 shrink-0 flex-col gap-1">
        <Select
          status={operatorError ? 'error' : undefined}
          placeholder="Select operator"
          value={value.operator ?? undefined}
          onChange={(val) => {
            const operator = val as TMatchOperator;
            if (!operator || operator === value.operator) return;
            if (!operatorTakesValue(operator)) {
              handleChange({ ...value, operator, value: '' });
              return;
            }
            handleChange({ ...value, operator });
          }}
          options={operatorOptions}
        />
        <FieldMessage message={operatorError} />
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <Input
          status={valueError ? 'error' : undefined}
          disabled={!takesValue}
          value={value.value ?? ''}
          onChange={(e) => handleChange({ ...value, value: e.target.value })}
          placeholder="Enter value"
        />
        <FieldMessage message={valueError} />
      </div>
    </div>
  );
};
