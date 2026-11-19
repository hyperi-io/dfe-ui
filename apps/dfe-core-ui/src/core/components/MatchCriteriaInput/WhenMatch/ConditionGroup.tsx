import { Tooltip } from '@/core/components/Tooltip';
import { MATCH_NESTING_LIMIT } from '@repo/dfe-engine-types/limits';
import { IconPlus, IconSubtask, IconTrash } from '@repo/dfe-icons';
import { cn } from '@repo/dfe-shared-ui';
import { Button, Select } from 'antd';
import { ConditionRow } from './ConditionRow';
import {
  emptyCondition,
  GROUP_MODES,
  groupModeOf,
  isMatchGroup,
} from './WhenMatch.helpers';
import {
  FieldPath,
  GroupMode,
  TMatchFormNode,
  TMatchJoin,
} from './WhenMatch.types';

export const ConditionGroup = ({
  path,
  number,
  node,
  level,
  onRemove,
  onChange,
}: {
  path: FieldPath;
  number: string;
  node: TMatchFormNode;
  level: number;
  onRemove?: () => void;
  onChange: (next: TMatchFormNode | null) => void;
}) => {
  const parts = node.parts ?? [];
  const canNest = level < MATCH_NESTING_LIMIT;
  const isRoot = level === 1;
  const label = isRoot ? 'Conditions' : `Group ${number}`;

  const setParts = (nextParts: TMatchFormNode[]) =>
    onChange({ ...node, parts: nextParts });

  const replacePart = (index: number, next: TMatchFormNode | null) => {
    const nextParts =
      next === null
        ? parts.filter((_, position) => position !== index)
        : parts.map((part, position) => (position === index ? next : part));
    if (nextParts.length === 0) {
      onChange(null);
      return;
    }
    setParts(nextParts);
  };

  const setMode = (value: GroupMode) => {
    const mode = GROUP_MODES.find((entry) => entry.value === value);
    if (!mode) return;
    onChange({ ...node, join: mode.join as TMatchJoin, negate: mode.negate });
  };

  return (
    <div
      role="group"
      aria-label={label}
      className={cn(
        'flex flex-col gap-2 rounded-md border p-3',
        'border-foreground/15 dark:border-dark-foreground/15',
        !isRoot && 'bg-foreground/[0.02] dark:bg-dark-foreground/[0.03]',
      )}
    >
      {/* <Form.Item name={[...path, 'join']} hidden>
        <HiddenValue />
      </Form.Item>
      <Form.Item name={[...path, 'negate']} hidden>
        <HiddenValue />
      </Form.Item> */}
      <div className="flex items-center gap-2 text-sm">
        <span>{isRoot ? 'Match when' : 'When'}</span>
        <Select
          aria-label={`${label}: how the conditions combine`}
          className="w-28"
          value={groupModeOf(node)}
          onChange={setMode}
          options={GROUP_MODES.map(({ value, label: text }) => ({
            value,
            label: text,
          }))}
        />
        <span>of these are true</span>
        {onRemove && (
          <Tooltip title={`Remove group ${number}`}>
            <Button
              className="ml-auto"
              type="text"
              aria-label={`Remove group ${number}`}
              icon={<IconTrash className="w-4 h-4" />}
              onClick={onRemove}
            />
          </Tooltip>
        )}
      </div>

      {parts.map((part, index) => {
        const partPath = [...path, 'parts', index];
        const partNumber = isRoot ? `${index + 1}` : `${number}.${index + 1}`;
        return isMatchGroup(part) ? (
          <ConditionGroup
            key={partNumber}
            path={partPath}
            number={partNumber}
            node={part}
            level={level + 1}
            onRemove={() => replacePart(index, null)}
            onChange={(next) => replacePart(index, next)}
          />
        ) : (
          <ConditionRow
            key={partNumber}
            number={partNumber}
            node={part}
            onRemove={() => replacePart(index, null)}
            onChange={(next) => replacePart(index, next)}
          />
        );
      })}

      <div className="flex gap-2">
        <Button
          type="link"
          className="px-0"
          icon={<IconPlus className="w-4 h-4" />}
          onClick={() => setParts([...parts, emptyCondition()])}
        >
          Add condition
        </Button>
        <Tooltip
          title={
            canNest
              ? undefined
              : `Groups nest at most ${MATCH_NESTING_LIMIT} deep`
          }
        >
          <Button
            type="link"
            className="px-0"
            disabled={!canNest}
            icon={<IconSubtask className="w-4 h-4" />}
            onClick={() =>
              setParts([
                ...parts,
                { join: 'all', parts: [emptyCondition(), emptyCondition()] },
              ])
            }
          >
            Add group
          </Button>
        </Tooltip>
      </div>
    </div>
  );
};
