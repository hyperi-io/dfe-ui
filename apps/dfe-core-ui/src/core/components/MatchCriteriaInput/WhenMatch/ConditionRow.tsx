import { Tooltip } from '@/core/components/Tooltip';
import { IconTrash } from '@repo/dfe-icons';
import { Button, Checkbox, Input, Select } from 'antd';
import { FieldMessage } from './FieldMessage';
import { issueMessage, operatorTakesValue } from './WhenMatch.helpers';
import { FieldPath, TMatchFormNode, TMatchOperator } from './WhenMatch.types';

export const ConditionRow = ({
  number,
  node,
  path,
  issues,
  onRemove,
  onChange,
  operatorOptions,
}: {
  number: string;
  node: TMatchFormNode;
  path: FieldPath;
  issues?: { path: FieldPath; message: string }[];
  onRemove: () => void;
  onChange: (next: TMatchFormNode | null) => void;
  operatorOptions: { label: string; value: TMatchOperator }[];
}) => {
  const takesValue = operatorTakesValue(node.operator);
  const name = `Condition ${number}`;
  const fieldError = issueMessage(issues, [...path, 'field']);
  const operatorError = issueMessage(issues, [...path, 'operator']);
  const valueError = issueMessage(issues, [...path, 'value']);

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

      <div className="flex min-w-0 flex-col gap-1">
        <Input
          aria-label={`${name} field`}
          status={fieldError ? 'error' : undefined}
          placeholder="Field"
          value={node.field ?? ''}
          onChange={(event) =>
            handleChange({ ...node, field: event.target.value })
          }
        />
        <FieldMessage message={fieldError} />
      </div>

      <div className="flex flex-col gap-1">
        <Select
          aria-label={`${name} operator`}
          status={operatorError ? 'error' : undefined}
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
          options={operatorOptions}
        />
        <FieldMessage message={operatorError} />
      </div>

      <div className="flex min-w-0 flex-col gap-1">
        <Input
          aria-label={`${name} value`}
          status={valueError ? 'error' : undefined}
          disabled={!takesValue}
          placeholder="Value"
          value={node.value ?? ''}
          onChange={(event) =>
            handleChange({ ...node, value: event.target.value })
          }
        />
        <FieldMessage message={valueError} />
      </div>

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
