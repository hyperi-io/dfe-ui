'use client';

import { Tooltip } from '@/core/components/Tooltip';
import { cn } from '@/core/utils/style';
import {
  IconArrowDown,
  IconArrowUp,
  IconDotsVertical,
  IconGripVertical,
  IconPin,
} from '@repo/dfe-icons';
import { Button, Dropdown } from 'antd';
import { useEffect, useId, useRef, useState } from 'react';

export type SortableRuleItem = {
  id: string;
  /** Runs where the engine puts it and refuses a move, so it gets no handle. */
  pinned?: boolean;
};

type Control = 'handle' | 'up' | 'down' | 'menu';

/** Where a dragged row lands: before the row under the pointer, or after it. */
type DropTarget = { index: number; after: boolean };

/**
 * A first-match list whose order is edited by drag, by keyboard and by menu.
 *
 * Dragging is pointer-only, so every move it offers is also a button (WCAG 2.2
 * SC 2.5.7): Move up, Move down and a move-to-position menu on each row, and
 * the arrow keys on its handle. Each move is announced in a live region as
 * "Moved <name> to position N of M", and focus stays on the control that made
 * it. Pinned rows sit where the engine keeps them and are never a drop target
 * past which a movable row could land.
 */
export function SortableRuleList<T extends SortableRuleItem>({
  items,
  label,
  itemName,
  renderItem,
  onMove,
  disabled = false,
}: {
  items: T[];
  /** The list's accessible name. */
  label: string;
  /** What a row is called in its controls and announcements. */
  itemName: (item: T) => string;
  renderItem: (item: T, position: number) => React.ReactNode;
  onMove: (from: number, to: number) => void;
  disabled?: boolean;
}) {
  const instructionsId = useId();
  // The count re-keys the message, so a repeat of the same words is announced again.
  const [announcement, setAnnouncement] = useState({ text: '', count: 0 });
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dropTarget, setDropTarget] = useState<DropTarget | null>(null);
  const pendingFocus = useRef<{ id: string; control: Control } | null>(null);
  const controls = useRef(new Map<string, HTMLElement | null>());

  const movableCount = items.filter((item) => !item.pinned).length;
  const movable = (index: number) =>
    !disabled && index < movableCount && !items[index]?.pinned;

  useEffect(() => {
    const pending = pendingFocus.current;
    if (!pending) return;
    pendingFocus.current = null;
    const element =
      controls.current.get(`${pending.id}:${pending.control}`) ??
      controls.current.get(`${pending.id}:handle`);
    element?.focus();
  }, [items]);

  const move = (from: number, to: number, control: Control) => {
    const item = items[from];
    if (!item || from === to || to < 0 || to >= movableCount) return;
    // A button that the move disables cannot keep focus, so the handle takes it.
    const lands =
      (control === 'up' && to === 0) ||
      (control === 'down' && to === movableCount - 1)
        ? 'handle'
        : control;
    pendingFocus.current = { id: item.id, control: lands };
    onMove(from, to);
    setAnnouncement(({ count }) => ({
      text: `Moved ${itemName(item)} to position ${to + 1} of ${movableCount}.`,
      count: count + 1,
    }));
  };

  const register =
    (id: string, control: Control) => (element: HTMLElement | null) => {
      controls.current.set(`${id}:${control}`, element);
    };

  const handleKeyDown = (event: React.KeyboardEvent, index: number) => {
    if (event.key === 'ArrowUp') {
      event.preventDefault();
      move(index, index - 1, 'handle');
    } else if (event.key === 'ArrowDown') {
      event.preventDefault();
      move(index, index + 1, 'handle');
    } else if (event.key === 'Home') {
      event.preventDefault();
      move(index, 0, 'handle');
    } else if (event.key === 'End') {
      event.preventDefault();
      move(index, movableCount - 1, 'handle');
    }
  };

  const landingIndex = (target: DropTarget, from: number) => {
    const raw = target.after ? target.index + 1 : target.index;
    const adjusted = raw > from ? raw - 1 : raw;
    return Math.min(Math.max(adjusted, 0), movableCount - 1);
  };

  const clearDrag = () => {
    setDragIndex(null);
    setDropTarget(null);
  };

  return (
    <div className="flex flex-col">
      <p id={instructionsId} className="sr-only">
        Press the up and down arrow keys on a row&apos;s handle to move it, or
        use its move buttons.
      </p>
      <div
        role="status"
        aria-live="assertive"
        aria-atomic="true"
        className="sr-only"
      >
        <span key={announcement.count}>{announcement.text}</span>
      </div>
      <ol aria-label={label} className="m-0 flex list-none flex-col gap-1 p-0">
        {items.map((item, index) => {
          const name = itemName(item);
          const canMove = movable(index);
          const showLineBefore =
            dragIndex !== null &&
            dropTarget?.index === index &&
            !dropTarget.after;
          const showLineAfter =
            dragIndex !== null &&
            dropTarget?.index === index &&
            dropTarget.after;
          return (
            <li
              key={item.id}
              data-testid={`rule-block-${item.id}`}
              draggable={canMove}
              onDragStart={(event) => {
                if (!canMove) return;
                event.dataTransfer.effectAllowed = 'move';
                event.dataTransfer.setData('text/plain', item.id);
                setDragIndex(index);
              }}
              onDragOver={(event) => {
                if (dragIndex === null || index >= movableCount) return;
                event.preventDefault();
                event.dataTransfer.dropEffect = 'move';
                const box = event.currentTarget.getBoundingClientRect();
                const after = event.clientY > box.top + box.height / 2;
                setDropTarget({ index, after });
              }}
              onDrop={(event) => {
                event.preventDefault();
                if (dragIndex !== null && dropTarget) {
                  move(
                    dragIndex,
                    landingIndex(dropTarget, dragIndex),
                    'handle',
                  );
                }
                clearDrag();
              }}
              onDragEnd={clearDrag}
              className={cn(
                'relative flex items-center gap-2 rounded-md border px-2 py-2',
                'border-foreground/15 bg-background dark:border-dark-foreground/15 dark:bg-dark-background',
                dragIndex === index && 'opacity-50',
                item.pinned &&
                  'bg-foreground/[0.03] dark:bg-dark-foreground/[0.04]',
              )}
            >
              {showLineBefore && (
                <span
                  aria-hidden
                  className="absolute -top-1 left-0 right-0 h-0.5 rounded bg-tertiary"
                />
              )}
              {canMove ? (
                <Tooltip title="Drag, or use the arrow keys">
                  <button
                    ref={register(item.id, 'handle')}
                    type="button"
                    aria-label={`Reorder ${name}, position ${index + 1} of ${movableCount}`}
                    aria-describedby={instructionsId}
                    onKeyDown={(event) => handleKeyDown(event, index)}
                    className={cn(
                      'flex h-7 w-6 shrink-0 cursor-grab items-center justify-center rounded',
                      'text-foreground/50 hover:text-foreground focus-visible:outline-2 focus-visible:outline-tertiary',
                      'dark:text-dark-foreground/50 dark:hover:text-dark-foreground',
                    )}
                  >
                    <IconGripVertical className="h-4 w-4" />
                  </button>
                </Tooltip>
              ) : !item.pinned ? (
                <span aria-hidden className="h-7 w-6 shrink-0" />
              ) : (
                <Tooltip title="Pinned: runs here whatever the order says">
                  <span
                    role="img"
                    aria-label={`${name} is pinned`}
                    className="flex h-7 w-6 shrink-0 items-center justify-center text-foreground/40 dark:text-dark-foreground/40"
                  >
                    <IconPin className="h-4 w-4" />
                  </span>
                </Tooltip>
              )}
              <span className="w-6 shrink-0 text-center text-sm tabular-nums text-foreground/50 dark:text-dark-foreground/50">
                {index + 1}
              </span>
              <div className="min-w-0 flex-1">
                {renderItem(item, index + 1)}
              </div>
              {canMove && (
                <div className="flex shrink-0 items-center">
                  <Tooltip title="Move up">
                    <Button
                      ref={register(item.id, 'up')}
                      type="text"
                      size="small"
                      aria-label={`Move ${name} up`}
                      disabled={index === 0}
                      icon={<IconArrowUp className="h-4 w-4" />}
                      onClick={() => move(index, index - 1, 'up')}
                    />
                  </Tooltip>
                  <Tooltip title="Move down">
                    <Button
                      ref={register(item.id, 'down')}
                      type="text"
                      size="small"
                      aria-label={`Move ${name} down`}
                      disabled={index === movableCount - 1}
                      icon={<IconArrowDown className="h-4 w-4" />}
                      onClick={() => move(index, index + 1, 'down')}
                    />
                  </Tooltip>
                  <Dropdown
                    trigger={['click']}
                    menu={{
                      items: Array.from({ length: movableCount }, (_, to) => ({
                        key: String(to),
                        label: `Position ${to + 1}`,
                        disabled: to === index,
                      })),
                      onClick: ({ key }) => move(index, Number(key), 'menu'),
                    }}
                  >
                    <Button
                      ref={register(item.id, 'menu')}
                      type="text"
                      size="small"
                      aria-label={`Move ${name} to position`}
                      icon={<IconDotsVertical className="h-4 w-4" />}
                    />
                  </Dropdown>
                </div>
              )}
              {showLineAfter && (
                <span
                  aria-hidden
                  className="absolute -bottom-1 left-0 right-0 h-0.5 rounded bg-tertiary"
                />
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
