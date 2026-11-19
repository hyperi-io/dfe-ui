import { IconPlus } from '@repo/dfe-icons';
import { Button } from 'antd';
import { useState } from 'react';
import { ConditionGroup } from './ConditionGroup';
import { SingleCondition } from './SingleCondition';
import { emptyCondition, isMatchGroup } from './WhenMatch.helpers';
import { TMatchFormNode } from './WhenMatch.types';

export const MatchConditionsEditor = ({
  value,
  onChange,
}: {
  value: TMatchFormNode | null;
  onChange: (value: TMatchFormNode | null) => void;
}) => {
  const [match, setMatch] = useState<TMatchFormNode | null>(value);

  const setRoot = (next: TMatchFormNode | null) => {
    const onlyPart = next?.parts?.length === 1 ? next.parts[0] : undefined;
    const collapses =
      !!next &&
      !next.negate &&
      !!onlyPart &&
      !isMatchGroup(onlyPart) &&
      !onlyPart.negate;
    if (next === null) {
      setMatch(emptyCondition());
    } else if (collapses && onlyPart) {
      setMatch({
        field: onlyPart.field ?? '',
        operator: onlyPart.operator ?? 'equals',
        value: onlyPart.value ?? '',
      });
    } else {
      setMatch(next);
    }
  };

  const handleChange = (next: TMatchFormNode | null) => {
    setMatch(next);
    onChange(next);
  };

  if (!match || !isMatchGroup(match)) {
    return (
      <div className="flex flex-col gap-1">
        <SingleCondition value={match} onChange={handleChange} />
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
                    field: match?.field ?? '',
                    operator: match?.operator ?? 'equals',
                    value: match?.value ?? '',
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
      path={['match']}
      number=""
      node={match}
      level={1}
      onChange={setRoot}
    />
  );
};
