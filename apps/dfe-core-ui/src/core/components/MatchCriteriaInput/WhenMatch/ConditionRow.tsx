import { Tooltip } from '@/core/components/Tooltip';
import { IconTrash } from '@repo/dfe-icons';
import { Button, Checkbox, Input, Select } from 'antd';
import { OPERATOR_OPTIONS, operatorTakesValue } from './WhenMatch.helpers';
import { TMatchFormNode, TMatchOperator } from './WhenMatch.types';

export const ConditionRow = ({
  number,
  node,
  onRemove,
  onChange,
}: {
  number: string;
  node: TMatchFormNode;
  onRemove: () => void;
  onChange: (next: TMatchFormNode | null) => void;
}) => {
  const takesValue = operatorTakesValue(node.operator);
  const name = `Condition ${number}`;

  const handleChange = (next: TMatchFormNode | null) => {
    onChange(next);
  };

  return (
    <div
      role="group"
      aria-label={name}
      className="grid grid-cols-[auto_minmax(0,1fr)_9rem_minmax(0,1fr)_auto] items-start gap-x-2"
    >
      <Checkbox aria-label={`${name}: not`}>Not</Checkbox>

      <Input aria-label={`${name} field`} placeholder="Field" />

      <Select
        aria-label={`${name} operator`}
        placeholder="Operator"
        onChange={(value) => {
          if (!operatorTakesValue(value)) {
            handleChange({ ...node, operator: value as TMatchOperator });
          }
        }}
        options={OPERATOR_OPTIONS}
      />

      <Input
        aria-label={`${name} value`}
        disabled={!takesValue}
        placeholder="Value"
      />

      <Tooltip title={`Remove condition ${number}`}>
        <Button
          type="text"
          aria-label={`Remove condition ${number}`}
          icon={<IconTrash className="w-4 h-4" />}
          onClick={onRemove}
        />
      </Tooltip>
    </div>
  );
};
