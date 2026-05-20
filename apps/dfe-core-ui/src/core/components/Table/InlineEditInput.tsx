import { IconCheck, IconEdit, IconX } from '@repo/dfe-icons';
import { Button, Input, InputProps } from 'antd';
import { ChangeEvent, useEffect, useRef, useState } from 'react';

interface InlineEditInputProps extends InputProps {
  initialValue?: string;
  editable?: boolean;
  defaultEditing?: boolean;
}

const transformLabel = (label: string) => {
  return label || 'None';
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
  editable = true,
  defaultEditing = false,
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
        <div className="flex items-center gap-x-1">
          <Input
            {...props}
            size="small"
            onChange={(e) => setDraft(e.target.value)}
            value={draft}
          />
          <Button
            icon={<IconX />}
            size="small"
            type="text"
            onClick={handleCancel}
          />
          <Button
            icon={<IconCheck />}
            size="small"
            type="text"
            onClick={handleUpdateValue}
          />
        </div>
      ) : (
        <div className="flex items-center gap-x-1">
          {editable && (
            <Button
              icon={<IconEdit />}
              size="small"
              type="text"
              onClick={handleEdit}
            />
          )}
          {transformLabel(resolved)}
        </div>
      )}
    </>
  );
};
