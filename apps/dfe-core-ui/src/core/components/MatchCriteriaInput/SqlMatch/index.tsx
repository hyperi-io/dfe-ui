import { AceEditor } from '@/core/components/AceEditor';
import { FormNotification } from '@/core/components/FormNotification';
import { IconCheck, IconX } from '@repo/dfe-icons';
import type { Editor } from 'ace-builds';
import { Button, Tag } from 'antd';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ValidateSql } from '..';
import { getNormalisedSql } from './SqlMatch.helpers';

interface SqlMatchProps {
  value?: string;
  onChange?: (value: string) => void;
  className?: string;
  validateSql: ValidateSql;
}

const READONLY_LINES = 3;

const SQL_PREFIX = `SELECT *
FROM {{source}}
WHERE`;

const documentFor = (whereClause: string) => `${SQL_PREFIX}\n${whereClause}`;

const whereClauseOf = (document: string) =>
  document.split('\n').slice(READONLY_LINES).join('\n');

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
  const lineHeight = editor.renderer.lineHeight;
  return {
    top: point.pageY - host.top + (lineHeight - 22) / 2,
    left: Math.min(Math.max(point.pageX - host.left + 8, 4), host.width - 96),
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
  });

  editor.commands.on('exec', (event) => {
    if (event.command.readOnly) return;
    const range = editor.getSelectionRange();
    const boundaryBackspace =
      event.command.name === 'backspace' &&
      range.isEmpty() &&
      range.start.row === READONLY_LINES &&
      range.start.column === 0;
    if (range.start.row >= READONLY_LINES && !boundaryBackspace) return;
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

export const SqlMatch = ({
  value,
  onChange,
  validateSql,
  ...props
}: SqlMatchProps) => {
  const [notice, setNotice] = useState<NoticePoint | null>(null);
  const hideNotice = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [sql, setSql] = useState(value ?? '');
  const editorRef = useRef<Editor | null>(null);

  const showNotice = useCallback((editor: Editor) => {
    setNotice(noticeAtCursor(editor));
    if (hideNotice.current) clearTimeout(hideNotice.current);
    hideNotice.current = setTimeout(() => setNotice(null), 1500);
  }, []);

  const handleCheckSql = () => {
    const normalisedSql = getNormalisedSql(documentFor(sql));
    validateSql?.mutate(normalisedSql);
  };

  const handleSqlChange = (document: string) => {
    const clause = whereClauseOf(document);
    // A blocked edit of the prefix shifts the lines. The lock puts them back,
    // so this document is not the one to keep.
    if (document !== documentFor(clause)) return;
    validateSql?.reset();
    setSql(clause);
    onChange?.(documentFor(clause));
  };

  useEffect(
    () => () => {
      if (hideNotice.current) clearTimeout(hideNotice.current);
    },
    [],
  );

  useEffect(() => {
    const editor = editorRef.current;
    const errors = (validateSql?.data?.errors ?? []).filter(
      (error) => error.message.length > 0,
    );
    if (!editor || validateSql?.data?.valid !== false || errors.length === 0)
      return;
    editor.session.setAnnotations(
      errors.map((error) => ({
        row: 0,
        column: 0,
        suggestion: error.suggestion,
        text: error.message,
        type: 'error',
      })),
    );
  }, [validateSql?.data]);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-end absolute top-12 right-2 z-10">
        {validateSql && (
          <Button
            icon={
              validateSql?.data ? (
                validateSql?.data?.valid ? (
                  <IconCheck />
                ) : (
                  <IconX />
                )
              ) : null
            }
            danger={validateSql?.data ? !validateSql?.data?.valid : false}
            type="default"

            loading={validateSql?.isPending}
            htmlType="button"
            onClick={handleCheckSql}
          >
            {validateSql?.data
              ? validateSql?.data?.valid
                ? 'SQL is valid'
                : 'SQL is invalid'
              : 'Check SQL'}
          </Button>
        )}
      </div>
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
          value={documentFor(sql)}
          height="200px"
          mode="sql"
          onChange={handleSqlChange}
          onLoad={(editor) => {
            editorRef.current = editor;
            return lockSqlPrefix(editor, () => showNotice(editor));
          }}
        />
      </div>
      {validateSql?.data && !validateSql?.data?.valid && (
        <FormNotification
          title="SQL is invalid"
          text={validateSql?.data?.errors
            ?.map((error) => error.message)
            .join(', ')}
          type="error"
        />
      )}
      {validateSql?.error && (
        <FormNotification
          title="Error checking SQL"
          text={validateSql?.error?.message}
          type="error"
        />
      )}
    </div>
  );
};
