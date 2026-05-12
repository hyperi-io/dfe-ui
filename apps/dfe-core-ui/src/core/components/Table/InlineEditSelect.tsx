import { cn } from '@/core/utils/style';
import { IconCheck, IconEdit, IconX } from '@repo/dfe-icons';
import { Button, Select, SelectProps, Tag } from 'antd';
import {
  ChangeEvent,
  startTransition,
  useEffect,
  useMemo,
  useState,
} from 'react';

interface InlineEditSelectProps extends SelectProps {
  initialValue?: string;
  editable?: boolean;
  defaultEditing?: boolean;
}

const transformLabel = (label: string | string[]) => {
  if (Array.isArray(label) && label.length === 0) {
    return 'None';
  }

  if (Array.isArray(label) && label.length > 0) {
    return label?.map((item: string) => <Tag key={item}>{item}</Tag>);
  }

  return label || 'None';
};

export const InlineEditSelect = ({
  value: propValue,
  initialValue,
  onChange,
  editable = true,
  options,
  defaultEditing = false,
  ...props
}: InlineEditSelectProps) => {
  const resolved = propValue ?? initialValue;
  const [isEditing, setIsEditing] = useState(defaultEditing);
  const [draft, setDraft] = useState(resolved);

  const [search, setSearch] = useState('');
  const filteredOptions = useMemo(() => {
    return options?.filter((option) =>
      option?.label?.toString().toLowerCase().includes(search.toLowerCase()),
    );
  }, [options, search]);

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

  const isMultiple = props.mode === 'multiple' && Array.isArray(resolved);

  // On error, set the input to edit mode to allow the user to correct the error
  const hasError = props['aria-invalid'] === 'true';
  useEffect(() => {
    if (hasError) {
      startTransition(() => {
        setIsEditing(true);
      });
    }
  }, [hasError, setIsEditing]);

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
          <Select
            {...props}
            className="w-full"
            size="small"
            onChange={(v) => setDraft(v)}
            value={draft}
            options={filteredOptions}
            showSearch={{
              onSearch: setSearch,
            }}
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
        <div
          className={cn('flex items-center gap-1', isMultiple && 'flex-wrap')}
        >
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
