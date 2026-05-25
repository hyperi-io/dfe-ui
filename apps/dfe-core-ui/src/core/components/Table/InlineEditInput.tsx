import { cn } from '@/core/utils/style';
import { IconCheck, IconEdit, IconX } from '@repo/dfe-icons';
import { Button, Input, InputProps } from 'antd';
import { ChangeEvent, useEffect, useRef, useState } from 'react';

interface InlineEditInputProps extends InputProps {
  initialValue?: string;
  editable?: boolean;
  defaultEditing?: boolean;
  onEdit?: () => void;
  classNames?: {
    input?: string;
    editContainer?: string;
    cancelButton?: string;
    acceptButton?: string;
    labelContainer?: string;
    editButton?: string;
    label?: string;
  };
}

const transformLabel = (label: string) => {
  return label ? (
    label
  ) : (
    <span className="text-foreground/40 dark:text-dark-foreground/40">
      None
    </span>
  );
};

const valueSignature = (v: unknown) =>
  v === undefined || v === null
    ? ''
    : typeof v === 'string' || typeof v === 'number'
      ? String(v)
      : JSON.stringify(v);

export const InlineEditInput = ({
  value: propValue,
  initialValue = '',
  onChange,
  onEdit,
  editable = true,
  defaultEditing = false,
  classNames,
  ...props
}: InlineEditInputProps) => {
  const resolved = (propValue ?? initialValue ?? '') as string;
  const [isEditing, setIsEditing] = useState(defaultEditing);
  const [draft, setDraft] = useState(resolved);

  const resolvedSigRef = useRef<string | null>(null);
  const resolvedSig = valueSignature(resolved);
  useEffect(() => {
    if (resolvedSigRef.current === null) {
      resolvedSigRef.current = resolvedSig;
      return;
    }
    if (resolvedSigRef.current === resolvedSig) {
      return;
    }
    resolvedSigRef.current = resolvedSig;
    queueMicrotask(() => setDraft(resolved));
    queueMicrotask(() => setIsEditing(false));
  }, [resolved, resolvedSig]);

  const handleUpdateValue = () => {
    onChange?.({ target: { value: draft } } as ChangeEvent<HTMLInputElement>);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleEdit = () => {
    if (!editable) return;
    setDraft(resolved);
    setIsEditing(true);
    onEdit?.();
  };

  // Edge-trigger validation UI: reopen when an error appears; dismiss editor when errors clear after promotion / fix.
  const hasError = props['aria-invalid'] === 'true';
  const prevHadErrorRef = useRef(false);
  useEffect(() => {
    if (hasError && !prevHadErrorRef.current) {
      queueMicrotask(() => setIsEditing(true));
    }
    if (!hasError && prevHadErrorRef.current) {
      queueMicrotask(() => setIsEditing(false));
    }
    prevHadErrorRef.current = hasError;
  }, [hasError]);

  return (
    <>
      {isEditing ? (
        <div
          className={cn('flex items-center gap-x-1', classNames?.editContainer)}
        >
          <Input
            {...props}
            className={cn('w-full', classNames?.input)}
            size="small"
            onChange={(e) => setDraft(e.target.value)}
            value={draft}
          />
          <Button
            className={classNames?.cancelButton}
            icon={<IconX />}
            size="small"
            type="text"
            onClick={handleCancel}
          />
          <Button
            className={classNames?.acceptButton}
            icon={<IconCheck />}
            size="small"
            type="text"
            onClick={handleUpdateValue}
          />
        </div>
      ) : (
        <div
          className={cn(
            'flex items-center gap-x-1',
            classNames?.labelContainer,
          )}
        >
          {editable && (
            <Button
              className={classNames?.editButton}
              icon={<IconEdit />}
              size="small"
              type="text"
              onClick={handleEdit}
            />
          )}
          <div className={classNames?.label}>{transformLabel(resolved)}</div>
        </div>
      )}
    </>
  );
};
