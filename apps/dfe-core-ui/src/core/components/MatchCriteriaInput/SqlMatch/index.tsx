import { AceEditor } from '@/core/components/AceEditor';
import type { Editor } from 'ace-builds';
import { Tag } from 'antd';
import { useCallback, useEffect, useRef, useState } from 'react';

interface SqlMatchProps {
  value?: string;
  onChange?: (value: string) => void;
  className?: string;
}

const READONLY_LINES = 3;

const SQL_PREFIX = `SELECT *
FROM {{source}}
WHERE`;

const documentFor = (whereClause: string) => `${SQL_PREFIX}\n${whereClause}`;

const NOTICE_COMMANDS = new Set(['insertstring', 'backspace']);

type NoticePoint = { top: number; left: number };

const noticeAtCursor = (editor: Editor): NoticePoint => {
  const cursor = editor.getCursorPosition();
  const renderer = editor.renderer as Editor['renderer'] & {
    textToScreenCoordinates: (
      row: number,
      column: number,
    ) => { pageX: number; pageY: number };
  };
  const point = renderer.textToScreenCoordinates(cursor.row, cursor.column);
  const host = editor.container.getBoundingClientRect();
  return {
    top: Math.max(point.pageY - host.top - 28, 4),
    left: Math.min(Math.max(point.pageX - host.left, 4), host.width - 96),
  };
};

const lockSqlPrefix = (editor: Editor, onBlocked: () => void) => {
  let restoring = false;
  const undo = editor.session.getUndoManager() as {
    lastDeltas?: unknown[];
  };

  editor.session.on('change', (delta) => {
    if (
      restoring ||
      (delta.action !== 'insert' && delta.action !== 'remove') ||
      delta.start.row >= READONLY_LINES
    ) {
      return;
    }
    restoring = true;
    editor.session.getDocument().revertDelta(delta);
    undo.lastDeltas?.pop();
    restoring = false;
    if (delta.action === 'remove') onBlocked();
  });

  editor.commands.on('exec', (event) => {
    if (event.command.readOnly) return;
    if (editor.getSelectionRange().start.row >= READONLY_LINES) return;
    (event as { preventDefault?: () => void }).preventDefault?.();
    if (NOTICE_COMMANDS.has(event.command.name ?? '')) onBlocked();
  });

  let fromPointer = false;
  editor.container.addEventListener(
    'mousedown',
    () => {
      fromPointer = true;
    },
    true,
  );

  editor.on('focus', () => {
    if (fromPointer) {
      fromPointer = false;
      return;
    }
    const column = editor.session.getLine(READONLY_LINES).length;
    editor.navigateTo(READONLY_LINES, column);
  });
};

export const SqlMatch = ({ value, onChange, ...props }: SqlMatchProps) => {
  const [notice, setNotice] = useState<NoticePoint | null>(null);
  const hideNotice = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showNotice = useCallback((editor: Editor) => {
    setNotice(noticeAtCursor(editor));
    if (hideNotice.current) clearTimeout(hideNotice.current);
    hideNotice.current = setTimeout(() => setNotice(null), 1500);
  }, []);

  useEffect(
    () => () => {
      if (hideNotice.current) clearTimeout(hideNotice.current);
    },
    [],
  );

  return (
    <div className="relative">
      {notice && (
        <Tag
          className="pointer-events-none absolute z-10 m-0"
          style={{ top: notice.top, left: notice.left }}
        >
          Read only
        </Tag>
      )}
      <AceEditor
        {...props}
        value={documentFor(value ?? '')}
        height="200px"
        mode="sql"
        onChange={onChange}
        onLoad={(editor) => lockSqlPrefix(editor, () => showNotice(editor))}
      />
    </div>
  );
};
