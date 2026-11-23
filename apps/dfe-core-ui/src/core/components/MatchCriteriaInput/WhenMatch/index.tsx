import { Tooltip } from '@/core/components/Tooltip';
import { IconArrowBackUp, IconArrowForwardUp, IconPlus } from '@repo/dfe-icons';
import { Button } from 'antd';
import { KeyboardEvent, useEffect, useRef, useState } from 'react';
import { ConditionGroup } from './ConditionGroup';
import { SingleCondition } from './SingleCondition';
import { emptyCondition, isMatchGroup } from './WhenMatch.helpers';
import {
  MatchSnapshot,
  matchHistory,
  recordMatch,
  redoMatch,
  undoMatch,
} from './WhenMatch.history';
import { TMatchFormNode, TMatchOperator } from './WhenMatch.types';

const normalize = (next: TMatchFormNode | null): MatchSnapshot => {
  const onlyPart = next?.parts?.length === 1 ? next.parts[0] : undefined;
  const collapses =
    !!next &&
    !next.negate &&
    !!onlyPart &&
    !isMatchGroup(onlyPart) &&
    !onlyPart.negate;
  if (next === null) return emptyCondition();
  if (collapses && onlyPart) {
    return {
      field: onlyPart.field ?? '',
      operator: onlyPart.operator ?? 'equals',
      value: onlyPart.value ?? '',
    };
  }
  return next;
};

export const MatchConditionsEditor = ({
  value,
  onChange,
  operatorOptions,
  matchDepthLimit = 4,
}: {
  value: TMatchFormNode | null;
  onChange: (value: TMatchFormNode | null) => void;
  operatorOptions: { label: string; value: TMatchOperator }[];
  matchDepthLimit: number;
}) => {
  const [history, setHistory] = useState(() => matchHistory(value));
  const historyRef = useRef(history);
  const rootRef = useRef<HTMLDivElement>(null);
  const restoring = useRef(false);
  const shortcutHandled = useRef(false);
  const match = history.present;

  useEffect(() => {
    if (!restoring.current) return;
    const timer = window.setTimeout(() => {
      restoring.current = false;
    }, 0);
    return () => window.clearTimeout(timer);
  });

  const commit = (next: TMatchFormNode | null) => {
    if (restoring.current) return;
    const applied = normalize(next);
    const recorded = recordMatch(historyRef.current, applied);
    if (recorded === historyRef.current) return;
    historyRef.current = recorded;
    setHistory(recorded);
    onChange(applied);
  };

  const restore = (next: ReturnType<typeof undoMatch>) => {
    if (next === historyRef.current) return;
    restoring.current = true;
    historyRef.current = next;
    setHistory(next);
    onChange(next.present);
  };

  const undo = () => {
    restore(undoMatch(historyRef.current));
  };

  const redo = () => {
    restore(redoMatch(historyRef.current));
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!(event.metaKey || event.ctrlKey) || event.altKey) return;
    const key = event.key.toLowerCase();
    const undoKey = key === 'z' && !event.shiftKey;
    const redoKey = (key === 'z' && event.shiftKey) || key === 'y';
    if (!undoKey && !redoKey) return;
    event.preventDefault();
    shortcutHandled.current = true;
    if (undoKey) undo();
    else redo();
  };

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const onHistoryInput = (event: Event) => {
      const inputType = (event as InputEvent).inputType;
      if (inputType !== 'historyUndo' && inputType !== 'historyRedo') return;
      // A single condition is one text field. The browser undoes that field
      // and reports it as a new edit, which drops the redo stack.
      event.preventDefault();
      event.stopPropagation();
      if (shortcutHandled.current) return;
      if (inputType === 'historyUndo') undo();
      else redo();
    };
    root.addEventListener('beforeinput', onHistoryInput, true);
    root.addEventListener('input', onHistoryInput, true);
    return () => {
      root.removeEventListener('beforeinput', onHistoryInput, true);
      root.removeEventListener('input', onHistoryInput, true);
    };
  });

  return (
    <div
      ref={rootRef}
      className="flex flex-col gap-1"
      onKeyDown={onKeyDown}
      onKeyUp={() => {
        shortcutHandled.current = false;
      }}
    >
      {(history.past.length !== 0 || history.future.length !== 0) && (
        <div className="flex justify-end gap-1">
          <Tooltip title="Undo">
            <Button
              type="text"
              aria-label="Undo"
              disabled={history.past.length === 0}
              icon={<IconArrowBackUp className="w-4 h-4" />}
              onClick={undo}
            />
          </Tooltip>
          <Tooltip title="Redo">
            <Button
              type="text"
              aria-label="Redo"
              disabled={history.future.length === 0}
              icon={<IconArrowForwardUp className="w-4 h-4" />}
              onClick={redo}
            />
          </Tooltip>
        </div>
      )}

      {!match || !isMatchGroup(match) ? (
        <>
          <SingleCondition
            value={match}
            onChange={commit}
            operatorOptions={operatorOptions}
          />
          <div>
            <Button
              type="link"
              className="px-0"
              icon={<IconPlus className="w-4 h-4" />}
              onClick={() =>
                commit({
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
        </>
      ) : (
        <ConditionGroup
          path={['match']}
          number=""
          node={match}
          level={1}
          onChange={commit}
          operatorOptions={operatorOptions}
          matchDepthLimit={matchDepthLimit}
        />
      )}
    </div>
  );
};
