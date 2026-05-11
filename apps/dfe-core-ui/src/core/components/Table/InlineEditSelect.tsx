import { cn } from '@/core/utils/style';
import { IconCheck, IconEdit, IconX } from '@repo/dfe-icons';
import { Button, Select, SelectProps, Tag } from 'antd';
import { ChangeEvent, useMemo, useState } from 'react';

interface InlineEditSelectProps extends SelectProps {
  initialValue?: string;
  editable?: boolean;
}

export const InlineEditSelect = ({
  value: propValue,
  initialValue,
  onChange,
  editable = true,
  options,
  ...props
}: InlineEditSelectProps) => {
  const resolved = propValue ?? initialValue;
  const [isEditing, setIsEditing] = useState(false);
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

  const isMultiple = props.mode === 'multiple';

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
          {isMultiple
            ? resolved?.map((item: string) => <Tag key={item}>{item}</Tag>)
            : resolved}
        </div>
      )}
    </>
  );
};
