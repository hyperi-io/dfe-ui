import { Form } from '@/core/components/Form';
import { Tooltip } from '@/core/components/Tooltip';
import { cn } from '@/core/utils/style';
import { CreateUpdateSourceFormData } from '@/Sources/components/CreateUpdateSourceForm';
import { MATCH_OPERATORS } from '@/Sources/components/CreateUpdateSourceForm/sourceForm.schema';
import {
  emptyCondition,
  isMatchGroup,
  MATCH_NESTING_LIMIT,
  operatorTakesValue,
  TMatchFormNode,
  TMatchJoin,
} from '@/Sources/utils/sourceMatch';
import { IconPlus, IconSubtask, IconTrash } from '@repo/dfe-icons';
import { Button, Checkbox, FormInstance, FormRule, Input, Select } from 'antd';

type FieldPath = (string | number)[];

type EditorProps = {
  form: FormInstance<CreateUpdateSourceFormData>;
  formValidation: FormRule;
};

/** How a group joins its parts, worded the way the header sentence reads. */
const GROUP_MODES = [
  { value: 'all', label: 'all', join: 'all', negate: false },
  { value: 'any', label: 'any', join: 'any', negate: false },
  { value: 'none', label: 'none', join: 'any', negate: true },
  { value: 'not-all', label: 'not all', join: 'all', negate: true },
] as const;

type GroupMode = (typeof GROUP_MODES)[number]['value'];

const groupModeOf = (node: TMatchFormNode): GroupMode =>
  GROUP_MODES.find(
    (mode) => mode.join === node.join && mode.negate === !!node.negate,
  )?.value ?? 'all';

const OPERATOR_OPTIONS = MATCH_OPERATORS.map((operator) => ({
  label: operator,
  value: operator,
}));

/** Registers a value the form must submit but no control on screen edits directly. */
const HiddenValue = (_: { value?: unknown }) => null;

/** The three fields a single condition has always had, at the same paths and labels. */
const SingleCondition = ({ form, formValidation }: EditorProps) => {
  const operator = Form.useWatch(['match', 'operator'], form);
  const takesValue = operatorTakesValue(operator);

  return (
    <div className="flex gap-x-2">
      <Form.Item
        className="w-full"
        name={['match', 'field']}
        label="Field"
        rules={[formValidation]}
        required
      >
        <Input placeholder="Enter field" />
      </Form.Item>
      <Form.Item
        name={['match', 'operator']}
        label="Operator"
        className="min-w-36"
        rules={[formValidation]}
        required
      >
        <Select
          placeholder="Select operator"
          onChange={(value) => {
            if (!operatorTakesValue(value)) {
              form.setFields([
                { name: ['match', 'value'], errors: [], value: '' },
              ]);
            }
          }}
          options={OPERATOR_OPTIONS}
        />
      </Form.Item>
      <Form.Item
        className="w-full"
        name={['match', 'value']}
        label="Value"
        rules={[formValidation]}
        required={takesValue}
      >
        <Input disabled={!takesValue} placeholder="Enter value" />
      </Form.Item>
    </div>
  );
};

/** One condition inside a group: its fields are named by its place, as `Condition 2.1 field`. */
const ConditionRow = ({
  form,
  formValidation,
  path,
  number,
  node,
  onRemove,
}: EditorProps & {
  path: FieldPath;
  number: string;
  node: TMatchFormNode;
  onRemove: () => void;
}) => {
  const takesValue = operatorTakesValue(node.operator);
  const name = `Condition ${number}`;
  // A part's path is built at run time, which the typed name paths cannot express.
  const untypedForm = form as FormInstance;

  return (
    <div
      role="group"
      aria-label={name}
      className="grid grid-cols-[auto_minmax(0,1fr)_9rem_minmax(0,1fr)_auto] items-start gap-x-2"
    >
      <Form.Item
        name={[...path, 'negate']}
        valuePropName="checked"
        className="pt-1"
      >
        <Checkbox aria-label={`${name}: not`}>Not</Checkbox>
      </Form.Item>
      <Form.Item name={[...path, 'field']} rules={[formValidation]} required>
        <Input aria-label={`${name} field`} placeholder="Field" />
      </Form.Item>
      <Form.Item name={[...path, 'operator']} rules={[formValidation]} required>
        <Select
          aria-label={`${name} operator`}
          placeholder="Operator"
          onChange={(value) => {
            if (!operatorTakesValue(value)) {
              untypedForm.setFields([
                { name: [...path, 'value'], errors: [], value: '' },
              ]);
            }
          }}
          options={OPERATOR_OPTIONS}
        />
      </Form.Item>
      <Form.Item
        name={[...path, 'value']}
        rules={[formValidation]}
        required={takesValue}
      >
        <Input
          aria-label={`${name} value`}
          disabled={!takesValue}
          placeholder="Value"
        />
      </Form.Item>
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

/**
 * A group of conditions, and the groups nested in it, up to the engine's limit.
 *
 * Parts are edited through the form store, so a row added here is in the
 * submitted values the moment its fields mount.
 */
const ConditionGroup = ({
  form,
  formValidation,
  path,
  number,
  node,
  level,
  onRemove,
  onChange,
}: EditorProps & {
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
      <Form.Item name={[...path, 'join']} hidden>
        <HiddenValue />
      </Form.Item>
      <Form.Item name={[...path, 'negate']} hidden>
        <HiddenValue />
      </Form.Item>
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
            form={form}
            formValidation={formValidation}
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
            form={form}
            formValidation={formValidation}
            path={partPath}
            number={partNumber}
            node={part}
            onRemove={() => replacePart(index, null)}
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

/**
 * The receiver match as conditions.
 *
 * One condition is the three fields it always was. Adding a second turns the
 * match into a group, and taking a group back to one plain condition returns
 * it to those three fields, so a single-condition source saves as it did.
 */
export const MatchConditions = ({ form, formValidation }: EditorProps) => {
  const root = Form.useWatch('match', { form, preserve: true }) as
    TMatchFormNode | undefined;

  const setRoot = (next: TMatchFormNode | null) => {
    const onlyPart = next?.parts?.length === 1 ? next.parts[0] : undefined;
    const collapses =
      !!next &&
      !next.negate &&
      !!onlyPart &&
      !isMatchGroup(onlyPart) &&
      !onlyPart.negate;
    if (next === null) {
      form.setFieldValue('match', emptyCondition());
    } else if (collapses && onlyPart) {
      form.setFieldValue('match', {
        field: onlyPart.field ?? '',
        operator: onlyPart.operator ?? 'equals',
        value: onlyPart.value ?? '',
      });
    } else {
      form.setFieldValue('match', next);
    }
  };

  if (!root || !isMatchGroup(root)) {
    return (
      <div className="flex flex-col gap-1">
        <SingleCondition form={form} formValidation={formValidation} />
        <div>
          <Button
            type="link"
            className="px-0"
            icon={<IconPlus className="w-4 h-4" />}
            onClick={() =>
              setRoot({
                join: 'all',
                parts: [
                  {
                    field: root?.field ?? '',
                    operator: root?.operator ?? 'equals',
                    value: root?.value ?? '',
                  },
                  emptyCondition(),
                ],
              })
            }
          >
            Add condition
          </Button>
        </div>
      </div>
    );
  }

  return (
    <ConditionGroup
      form={form}
      formValidation={formValidation}
      path={['match']}
      number=""
      node={root}
      level={1}
      onChange={setRoot}
    />
  );
};
