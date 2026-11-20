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
      <Checkbox
        aria-label={`${name}: not`}
        checked={!!node.negate}
        onChange={(event) =>
          handleChange({ ...node, negate: event.target.checked })
        }
      >
        Not
      </Checkbox>

      <Input
        aria-label={`${name} field`}
        placeholder="Field"
        value={node.field ?? ''}
        onChange={(event) =>
          handleChange({ ...node, field: event.target.value })
        }
      />

      <Select
        aria-label={`${name} operator`}
        placeholder="Operator"
        value={node.operator ?? undefined}
        onChange={(value) => {
          const operator = value as TMatchOperator;
          handleChange({
            ...node,
            operator,
            value: operatorTakesValue(operator) ? node.value : '',
          });
        }}
        options={OPERATOR_OPTIONS}
      />

      <Input
        aria-label={`${name} value`}
        disabled={!takesValue}
        placeholder="Value"
        value={node.value ?? ''}
        onChange={(event) =>
          handleChange({ ...node, value: event.target.value })
        }
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
