import { Input, Select } from 'antd';
import { OPERATOR_OPTIONS, operatorTakesValue } from './WhenMatch.helpers';
import { TMatchFormNode, TMatchOperator } from './WhenMatch.types';

export const SingleCondition = ({
  value: valueProp,
  onChange,
}: {
  value: TMatchFormNode | null;
  onChange: (value: TMatchFormNode | null) => void;
}) => {
  const value = valueProp ?? {};
  const takesValue = operatorTakesValue(value.operator);

  const handleChange = (next: TMatchFormNode | null) => {
    onChange(next);
  };

  return (
    <div className="flex gap-x-2">
      <Input
        value={value.field ?? ''}
        onChange={(e) => handleChange({ ...value, field: e.target.value })}
        placeholder="Enter field"
      />

      <Select
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
        options={OPERATOR_OPTIONS}
      />

      <Input
        disabled={!takesValue}
        value={value.value ?? ''}
        onChange={(e) => handleChange({ ...value, value: e.target.value })}
        placeholder="Enter value"
      />
    </div>
  );
};
