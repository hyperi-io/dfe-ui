import { IconCheck, IconEdit, IconX } from '@repo/dfe-icons';
import { Button, Input, InputProps } from 'antd';
import { ChangeEvent, startTransition, useEffect, useState } from 'react';

interface InlineEditInputProps extends InputProps {
  initialValue?: string;
  editable?: boolean;
  defaultEditing?: boolean;
}

const transformLabel = (label: string) => {
  return label || 'None';
};

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

  // On error, set the input to edit mode to allow the user to correct the error
  const hasError = props['aria-invalid'] === 'true';
  useEffect(() => {
    if (hasError) {
      startTransition(() => {
        setIsEditing(true);
      });
    }
  }, [hasError, setIsEditing]);

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
